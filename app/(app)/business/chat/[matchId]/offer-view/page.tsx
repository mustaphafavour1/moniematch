'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

const fmtN = (n: number) => '₦' + n.toLocaleString('en-NG')

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function OfferViewPage() {
  const router      = useRouter()
  const params      = useParams()
  const searchParams = useSearchParams()
  const matchId     = params.matchId as string
  const offerId     = searchParams.get('offerId') || ''
  const mode        = searchParams.get('mode') || 'view' // 'view' | 'counter'

  const [offer, setOffer] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!offerId) return
    supabase.from('offers').select('*').eq('id', offerId).maybeSingle()
      .then(({ data }) => { setOffer(data as Record<string, unknown>); setLoading(false) })
  }, [offerId])

  if (loading) return (
    <div className="app-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
    </div>
  )

  if (!offer) return (
    <div className="app-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Offer not found.</div>
    </div>
  )

  const returnType = offer.return_type as string
  const rows: [string, string][] = [
    ['Offer amount', fmtN(offer.amount as number)],
    ['Return type', returnType?.replace('_', ' ') || '—'],
    ...(offer.total_return_amount ? [['Total return', fmtN(offer.total_return_amount as number)] as [string,string]] : []),
    ...(offer.roi_percent ? [['ROI', `${offer.roi_percent}%`] as [string,string]] : []),
    ...(offer.equity_percent ? [['Equity stake', `${offer.equity_percent}%`] as [string,string]] : []),
    ...(offer.revenue_percent ? [['Revenue share', `${offer.revenue_percent}%`] as [string,string]] : []),
    ...(offer.monthly_payment ? [['Monthly payment', fmtN(offer.monthly_payment as number)] as [string,string]] : []),
    ...(offer.end_date ? [['End date', offer.end_date as string] as [string,string]] : []),
    ...(offer.reporting_frequency ? [['Reporting', offer.reporting_frequency as string] as [string,string]] : []),
    ...(offer.notes ? [['Notes', offer.notes as string] as [string,string]] : []),
  ]

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title={mode === 'counter' ? 'Counter offer' : 'Offer details'}
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      <div className="scroll" style={{ flex: 1, padding: '16px 22px 40px' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 20 }}>{fmtDate(offer.created_at as string)}</div>

        <div style={{ background: 'var(--bone)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden', marginBottom: 24 }}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 18px',
              borderTop: i > 0 ? '1px solid var(--line)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{k}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', textAlign: 'right', maxWidth: '60%' }}>{v}</span>
            </div>
          ))}
        </div>

        {mode === 'counter' && (
          <div style={{ background: 'var(--linen)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              To counter this offer, go to the conversation and use &quot;Make offer&quot; to propose your own terms.
            </div>
          </div>
        )}

        <button onClick={() => router.push(`/business/chat/${matchId}`)}
          className="btn btn-forest btn-block">
          Open conversation
        </button>
      </div>
    </div>
  )
}
