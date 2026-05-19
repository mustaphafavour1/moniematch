'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getDealForOffer } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function InvPayPage() {
  const router       = useRouter()
  const { matchId }  = useParams() as { matchId: string }
  const searchParams  = useSearchParams()
  const offerId       = searchParams.get('offerId') ?? ''

  const [offer,        setOffer]        = useState<{ amount: number; return_type: string } | null>(null)
  const [deal,         setDeal]         = useState<{ dealId: string; contractId: string | null } | null | undefined>(undefined)
  const [email,        setEmail]        = useState('')
  const [loading,      setLoading]      = useState(true)
  const [paying,       setPaying]       = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [error,        setError]        = useState('')

  useEffect(() => {
    if (!offerId) return
    Promise.all([
      supabase.from('offers').select('amount, return_type').eq('id', offerId).maybeSingle(),
      supabase.auth.getUser(),
      getDealForOffer(offerId),
    ]).then(([{ data: o }, { data: { user } }, dealInfo]) => {
      setOffer(o as { amount: number; return_type: string } | null)
      setEmail(user?.email || '')
      setDeal(dealInfo ? { dealId: dealInfo.dealId, contractId: dealInfo.contractId } : null)
      setLoading(false)
    })
  }, [offerId])

  const amount     = offer?.amount || 0
  const serviceFee = Math.min(Math.round(amount * 0.01), 5000)
  const total      = amount + serviceFee
  const fmtN       = (n: number) => '₦' + n.toLocaleString('en-NG')

  const noDeal      = deal === null
  const noContract  = deal !== undefined && deal !== null && !deal.contractId
  const canPay      = !noDeal && !noContract && acknowledged && deal?.contractId

  async function handlePay() {
    if (!canPay || !email) { setError('Please complete all requirements above.'); return }
    setPaying(true); setError('')
    try {
      const res = await fetch('/api/payment/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, matchId, contractId: deal!.contractId, investorEmail: email }),
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

  const RETURN_LABEL: Record<string, string> = { fixed: 'Fixed Returns', revenue_share: 'Revenue Share', equity: 'Equity' }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Proceed to payment"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky />

      <div className="scroll" style={{ flex: 1, padding: '20px 20px 40px' }}>

        {/* Amount card */}
        <div style={{ background: 'var(--bone)', borderRadius: 18, border: '1px solid var(--line)', padding: '20px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>Investment amount</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>{fmtN(amount)}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            {RETURN_LABEL[offer?.return_type || ''] || offer?.return_type || ''}
          </div>
        </div>

        {/* Breakdown */}
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
          <strong>{fmtN(amount)}</strong> will be sent directly to the business&apos;s bank account after payment. Your <strong>{fmtN(serviceFee)}</strong> platform fee is non-refundable. After payment you will sign the investment agreement.
        </div>

        {/* Agreement not ready warnings */}
        {noDeal && (
          <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#78350f', lineHeight: 1.6, marginBottom: 16 }}>
            <strong>Agreement not ready yet.</strong> The business has not yet signed the agreement for this offer. Please ask them to open the accepted offer and confirm it to generate the document.
          </div>
        )}
        {noContract && (
          <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#78350f', lineHeight: 1.6, marginBottom: 16 }}>
            <strong>Agreement document pending.</strong> The agreement is being prepared. Please check back in a moment.
          </div>
        )}

        {/* View agreement */}
        {deal?.contractId && (
          <button onClick={() => router.push(`/investor/chat/${matchId}/contract?contractId=${deal.contractId}`)}
            style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginBottom: 16 }}>
            View agreement →
          </button>
        )}

        {/* Acknowledgment checkbox */}
        {deal?.contractId && (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: 'var(--forest)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              I have read and agree to the terms of the investment agreement. I understand this payment is non-refundable once the agreement is signed by both parties.
            </span>
          </label>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginTop: 16 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: '12px 20px 32px', borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
        <button onClick={handlePay} disabled={!canPay || paying}
          className="btn btn-forest btn-block"
          style={{ opacity: !canPay || paying ? 0.45 : 1 }}>
          {paying ? 'Redirecting to Paystack…' : `Pay ${fmtN(total)} →`}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
          Secured by Paystack · 1% platform fee (max ₦5,000)
        </div>
      </div>
    </div>
  )
}
