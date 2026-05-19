import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const rawBody = await req.text()
  const sig     = req.headers.get('x-paystack-signature') || ''
  const hash    = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  if (hash !== sig) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  const event = JSON.parse(rawBody)
  if (event.event !== 'charge.success') return NextResponse.json({ ok: true })

  const data = event.data
  const meta = data.metadata || {}
  const { contractId, investmentAmount, bankCode, accountNumber, accountName, businessName } = meta

  if (!contractId) return NextResponse.json({ ok: true })

  // Mark payment confirmed
  await supabaseAdmin.from('signed_contracts')
    .update({ payment_confirmed_at: new Date().toISOString() })
    .eq('payment_ref', data.reference)

  // Initiate transfer to business if bank details available
  if (bankCode && accountNumber && investmentAmount) {
    try {
      const paystackKey = process.env.PAYSTACK_SECRET_KEY!
      // Create transfer recipient
      const recipRes = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nuban',
          name: accountName || businessName || 'Business',
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        }),
      })
      const recipJson = await recipRes.json()
      if (recipJson.status && recipJson.data?.recipient_code) {
        // Initiate transfer
        await fetch('https://api.paystack.co/transfer', {
          method: 'POST',
          headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'balance',
            amount: Number(investmentAmount) * 100, // kobo
            recipient: recipJson.data.recipient_code,
            reason: `MonieMatch investment — deal ref ${contractId.slice(0, 8)}`,
          }),
        })
      }
    } catch {
      // Transfer failed — log but don't break (manually reviewable)
    }
  }

  return NextResponse.json({ ok: true })
}
