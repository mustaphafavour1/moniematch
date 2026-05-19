import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 })

  const { offerId, matchId, contractId, investorEmail } = await req.json()
  if (!offerId || !matchId || !contractId || !investorEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Get offer amount + business bank details
  const { data: offer } = await supabaseAdmin.from('offers').select('amount, match_id').eq('id', offerId).maybeSingle()
  if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

  const { data: match } = await supabaseAdmin.from('matches')
    .select('business_id').eq('id', matchId).maybeSingle()
  const { data: biz } = match ? await supabaseAdmin.from('businesses')
    .select('bank_name, bank_code, account_number, account_name, name')
    .eq('id', match.business_id).maybeSingle() : { data: null }

  const amount = Number(offer.amount)
  const serviceFee = Math.min(Math.round(amount * 0.01), 5000)
  const totalCharge = amount + serviceFee
  const reference = `mm_${contractId.slice(0, 8)}_${Date.now()}`

  const body = {
    email: investorEmail,
    amount: totalCharge * 100, // kobo
    reference,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/payment/callback`,
    metadata: {
      offerId, matchId, contractId,
      investmentAmount: amount,
      serviceFee,
      bankCode:       biz?.bank_code       || '',
      accountNumber:  biz?.account_number  || '',
      accountName:    biz?.account_name    || '',
      businessName:   biz?.name            || '',
    },
  }

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.status) return NextResponse.json({ error: json.message || 'Paystack error' }, { status: 502 })

  // Store reference on signed_contracts
  await supabaseAdmin.from('signed_contracts').update({ payment_ref: reference }).eq('id', contractId)

  return NextResponse.json({ authorization_url: json.data.authorization_url, reference })
}
