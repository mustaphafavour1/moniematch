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

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: 'var(--ink-2)',  bg: 'var(--linen)' },
  accepted:  { label: 'Accepted',  color: 'var(--forest)', bg: '#ecfdf5' },
  rejected:  { label: 'Declined',  color: 'var(--clay)',   bg: '#fef2f2' },
  countered: { label: 'Countered', color: '#b45309',       bg: '#fef9ec' },
  withdrawn: { label: 'Withdrawn', color: 'var(--ink-3)',  bg: 'var(--linen)' },
}

export default function InvOfferViewPage() {
  const router       = useRouter()
  const params       = useParams()
  const searchParams = useSearchParams()
  const matchId      = params.matchId as string
  const offerId      = searchParams.get('offerId') || ''

  const [offer,   setOffer]   = useState<Record<string, unknown> | null>(null)
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

  const status = STATUS_LABEL[offer.status as string] || STATUS_LABEL.pending
  const rows: [string, string][] = [
    ['Offer amount',  fmtN(offer.amount as number)],
    ['Return type',   (offer.return_type as string)?.replace('_', ' ') || '—'],
    ...(offer.total_return_amount ? [['Total return', fmtN(offer.total_return_amount as number)] as [string,string]] : []),
    ...(offer.roi_percent         ? [['ROI', `${offer.roi_percent}%`] as [string,string]] : []),
    ...(offer.equity_percent      ? [['Equity stake', `${offer.equity_percent}%`] as [string,string]] : []),
    ...(offer.revenue_percent     ? [['Revenue share', `${offer.revenue_percent}%`] as [string,string]] : []),
    ...(offer.monthly_payment     ? [['Monthly payment', fmtN(offer.monthly_payment as number)] as [string,string]] : []),
    ...(offer.end_date            ? [['End date', offer.end_date as string] as [string,string]] : []),
    ...(offer.reporting_frequency ? [['Reporting', offer.reporting_frequency as string] as [string,string]] : []),
    ...(offer.notes               ? [['Notes', offer.notes as string] as [string,string]] : []),
  ]

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Offer details"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      <div className="scroll" style={{ flex: 1, padding: '16px 22px 40px' }}>
        {/* Status + date header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{fmtDate(offer.created_at as string)}</div>
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: status.color, background: status.bg,
            borderRadius: 999, padding: '4px 11px',
          }}>
            {status.label}
          </span>
        </div>

        {/* Offer rows */}
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

        {/* Status-specific info */}
        {offer.status === 'accepted' && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#065f46', lineHeight: 1.55 }}>
              This offer was accepted. The next step is to sign the investment agreement.
            </div>
          </div>
        )}
        {offer.status === 'countered' && (
          <div style={{ background: '#fef9ec', border: '1px solid #fcd34d', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.55 }}>
              The business has countered this offer. Check the conversation for their proposal.
            </div>
          </div>
        )}

        <button onClick={() => router.push(`/investor/chat/${matchId}`)}
          className="btn btn-forest btn-block">
          Open conversation
        </button>
      </div>
    </div>
  )
}
