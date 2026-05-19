import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference')
  if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 })

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const json = await res.json()
  if (!json.status || json.data?.status !== 'success') {
    return NextResponse.json({ verified: false, status: json.data?.status || 'unknown' })
  }

  const meta = json.data.metadata || {}
  return NextResponse.json({
    verified: true,
    contractId: meta.contractId,
    matchId: meta.matchId,
    offerId: meta.offerId,
  })
}
