import { NextResponse } from 'next/server'

export const revalidate = 86400 // cache for 24 hours

export async function GET() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) {
    // Return a hardcoded minimal list if key not yet configured
    return NextResponse.json([
      { name: 'Access Bank', code: '044' },
      { name: 'Citibank Nigeria', code: '023' },
      { name: 'Ecobank Nigeria', code: '050' },
      { name: 'Fidelity Bank', code: '070' },
      { name: 'First Bank of Nigeria', code: '011' },
      { name: 'First City Monument Bank', code: '214' },
      { name: 'Guaranty Trust Bank', code: '058' },
      { name: 'Heritage Bank', code: '030' },
      { name: 'Keystone Bank', code: '082' },
      { name: 'Kuda Bank', code: '090267' },
      { name: 'Opay', code: '100004' },
      { name: 'Palmpay', code: '100033' },
      { name: 'Polaris Bank', code: '076' },
      { name: 'Providus Bank', code: '101' },
      { name: 'Stanbic IBTC Bank', code: '221' },
      { name: 'Standard Chartered Bank', code: '068' },
      { name: 'Sterling Bank', code: '232' },
      { name: 'Union Bank of Nigeria', code: '032' },
      { name: 'United Bank For Africa', code: '033' },
      { name: 'Unity Bank', code: '215' },
      { name: 'Wema Bank', code: '035' },
      { name: 'Zenith Bank', code: '057' },
    ])
  }

  try {
    const res = await fetch('https://api.paystack.co/bank?country=nigeria&perPage=100', {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 86400 },
    })
    const json = await res.json()
    const banks = (json.data || []).map((b: { name: string; code: string }) => ({ name: b.name, code: b.code }))
    return NextResponse.json(banks)
  } catch {
    return NextResponse.json([], { status: 502 })
  }
}
