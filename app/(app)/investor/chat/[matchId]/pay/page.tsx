'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getDealForOffer } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function InvPayPage() {
  const router      = useRouter()
  const { matchId } = useParams() as { matchId: string }
  const searchParams = useSearchParams()
  const offerId     = searchParams.get('offerId') ?? ''

  const [offer,     setOffer]     = useState<{ amount: number; return_type: string } | null>(null)
  const [deal,      setDeal]      = useState<{ dealId: string; contractId: string | null } | null>(null)
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(true)
  const [paying,    setPaying]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!offerId) return
    Promise.all([
      supabase.from('offers').select('amount, return_type').eq('id', offerId).maybeSingle(),
      supabase.auth.getUser(),
      getDealForOffer(offerId),
    ]).then(([{ data: o }, { data: { user } }, dealInfo]) => {
      setOffer(o as { amount: number; return_type: string } | null)
      setEmail(user?.email || '')
      if (dealInfo) setDeal({ dealId: dealInfo.dealId, contractId: dealInfo.contractId })
      setLoading(false)
    })
  }, [offerId])

  const amount     = offer?.amount || 0
  const serviceFee = Math.min(Math.round(amount * 0.01), 5000)
  const total      = amount + serviceFee

  async function handlePay() {
    if (!deal?.contractId || !email) { setError('Missing contract or email. Please go back and try again.'); return }
    setPaying(true); setError('')
    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, matchId, contractId: deal.contractId, investorEmail: email }),
      })
      const data = await res.json()
      if (!res.ok || !data.authorization_url) throw new Error(data.error || 'Could not initialise payment')
      window.location.href = data.authorization_url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment failed. Please try again.')
      setPaying(false)
    }
  }

  if (loading) return (
    <div className="app-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
    </div>
  )

  const fmtN = (n: number) => '₦' + n.toLocaleString('en-NG')

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Proceed to payment"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky />

      <div className="scroll" style={{ flex: 1, padding: '20px 20px 40px' }}>

        <div style={{ background: 'var(--bone)', borderRadius: 18, border: '1px solid var(--line)', padding: '20px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>Investment amount</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>{fmtN(amount)}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            {({ fixed: 'Fixed Returns', revenue_share: 'Revenue Share', equity: 'Equity' } as Record<string,string>)[offer?.return_type || ''] || offer?.return_type || ''}
          </div>
        </div>

        <div style={{ background: 'var(--bone)', borderRadius: 14, border: '1px solid var(--line)', padding: '16px 18px', marginBottom: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Payment breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--ink-2)' }}>
              <span>Investment</span><span>{fmtN(amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--ink-2)' }}>
              <span>MonieMatch fee (1%, max ₦5,000)</span><span>{fmtN(serviceFee)}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
              <span>Total charge</span><span>{fmtN(total)}</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--linen)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 20 }}>
          The investment amount of <strong>{fmtN(amount)}</strong> will be sent directly to the business&apos;s bank account. Your fee of <strong>{fmtN(serviceFee)}</strong> covers the MonieMatch platform. After payment you will sign the agreement document.
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {deal?.contractId && (
          <button onClick={() => router.push(`/investor/chat/${matchId}/contract?contractId=${deal.contractId}`)}
            style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 10 }}>
            View agreement first
          </button>
        )}
      </div>

      <div style={{ padding: '12px 20px 32px', borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
        <button onClick={handlePay} disabled={paying || !deal?.contractId}
          className="btn btn-forest btn-block" style={{ opacity: paying || !deal?.contractId ? 0.6 : 1 }}>
          {paying ? 'Redirecting to Paystack…' : `Pay ${fmtN(total)} →`}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
          Secured by Paystack · 1% fee (max ₦5,000)
        </div>
      </div>
    </div>
  )
}
