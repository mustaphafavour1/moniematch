'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

interface Milestone { amount: number; description: string }

interface OfferData {
  id: string
  match_id: string
  proposer_id: string
  amount: number
  return_type: string
  status: string
  created_at: string
  is_milestoned: boolean
  milestones: Milestone[] | null
  reporting_frequency: string | null
  total_return_amount: number | null
  return_rate: number | null
  revenue_percent: number | null
  equity_percent: number | null
  notes: string | null
  matches: {
    businesses: { name: string } | null
    investors: { users: { name: string } | null } | null
  } | null
}

const fmtN = (n: number) => '₦' + n.toLocaleString('en-NG')

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:       { label: 'Pending',   color: 'var(--ink-2)',  bg: 'var(--linen)' },
  accepted:      { label: 'Accepted',  color: 'var(--forest)', bg: '#ecfdf5' },
  offer_accepted:{ label: 'Accepted',  color: 'var(--forest)', bg: '#ecfdf5' },
  rejected:      { label: 'Declined',  color: 'var(--clay)',   bg: '#fef2f2' },
  countered:     { label: 'Countered', color: '#b45309',       bg: '#fef9ec' },
  withdrawn:     { label: 'Withdrawn', color: 'var(--ink-3)',  bg: 'var(--linen)' },
}

const RETURN_LABEL: Record<string, string> = {
  fixed:         'Fixed returns',
  revenue_share: 'Revenue share',
  equity:        'Equity',
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--cream)',
      borderRadius: 12,
      border: '1px solid var(--line)',
      padding: '10px 12px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
    </div>
  )
}

export default function InvOfferViewPage() {
  const router       = useRouter()
  const params       = useParams()
  const searchParams = useSearchParams()
  const matchId      = params.matchId as string
  const offerId      = searchParams.get('offerId') || ''

  const [offer,   setOffer]   = useState<OfferData | null>(null)
  const [myId,    setMyId]    = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!offerId) return
    Promise.all([
      supabase.from('offers')
        .select('*, matches(businesses(name), investors(users(name)))')
        .eq('id', offerId)
        .maybeSingle(),
      supabase.auth.getUser(),
    ]).then(([{ data }, { data: { user } }]) => {
      setOffer(data as OfferData)
      setMyId(user?.id ?? '')
      setLoading(false)
    })
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

  const status       = STATUS_LABEL[offer.status] ?? STATUS_LABEL.pending
  const bizName      = offer.matches?.businesses?.name ?? 'Business'
  const investorName = offer.matches?.investors?.users?.name ?? 'Investor'
  const milestones   = offer.milestones ?? []
  const isAccepted   = offer.status === 'accepted' || offer.status === 'offer_accepted'
  const isCountered  = offer.status === 'countered'

  const chipRows: [string, string][][] = []
  const row1: [string, string][] = []
  if (offer.return_type)         row1.push(['Return type', RETURN_LABEL[offer.return_type] ?? offer.return_type])
  if (offer.reporting_frequency) row1.push(['Reporting', offer.reporting_frequency])
  if (row1.length) chipRows.push(row1)

  const row2: [string, string][] = []
  if (offer.total_return_amount != null || offer.return_rate != null) {
    const parts: string[] = []
    if (offer.total_return_amount != null) parts.push(fmtN(offer.total_return_amount))
    if (offer.return_rate != null)         parts.push(`${offer.return_rate}%`)
    row2.push(['Total return', parts.join(' ')])
  }
  if (offer.revenue_percent != null) row2.push(['Revenue share', `${offer.revenue_percent}% / month`])
  if (offer.equity_percent  != null) row2.push(['Equity stake',  `${offer.equity_percent}%`])
  if (row2.length) chipRows.push(row2)

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Offer"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      {/* Scrollable body */}
      <div className="scroll" style={{ flex: 1, padding: '16px 20px 24px' }}>

        {/* Preview card */}
        <div style={{
          background: 'var(--bone)',
          borderRadius: 18,
          border: '1px solid var(--line)',
          padding: '20px 18px',
          marginBottom: 20,
        }}>
          {/* Header row: title + status chip */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 2 }}>Offer to</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{bizName}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>From {investorName}</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: status.color, background: status.bg,
              borderRadius: 999, padding: '4px 11px',
              whiteSpace: 'nowrap', marginTop: 2,
            }}>
              {status.label}
            </span>
          </div>

          {/* Amount */}
          <div style={{ marginTop: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 4 }}>Investment</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>
              {fmtN(offer.amount)}
            </div>
          </div>

          {offer.is_milestoned && milestones.length > 0 ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8, fontWeight: 600 }}>Milestones</div>
              {milestones.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: 'var(--ink)', marginBottom: 6 }}>
                  <span>{m.description || `Milestone ${i + 1}`}</span>
                  <span style={{ fontWeight: 600 }}>{fmtN(m.amount)}</span>
                </div>
              ))}
            </div>
          ) : null}

          {/* Detail chips */}
          {chipRows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {row.map(([label, value]) => (
                <Chip key={label} label={label} value={value} />
              ))}
            </div>
          ))}
        </div>

        {offer.notes ? (
          <div style={{ background: 'var(--bone)', borderRadius: 12, border: '1px solid var(--line)',
            padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6, fontWeight: 600 }}>Notes</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{offer.notes}</div>
          </div>
        ) : null}
      </div>

      {/* Bottom action area — sticky */}
      <div style={{ padding: '12px 20px 32px', borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
        {isAccepted ? (
          <>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12,
              padding: '12px 14px', marginBottom: 12, fontSize: 13, color: '#065f46', lineHeight: 1.55 }}>
              Offer accepted! Proceed to make payment.
            </div>
            <button className="btn btn-forest btn-block"
              onClick={() => router.push(`/investor/chat/${matchId}/payment?offerId=${offerId}`)}>
              Proceed to escrow payment →
            </button>
          </>
        ) : isCountered ? (
          <>
            <div style={{ background: '#fef9ec', border: '1px solid #fcd34d', borderRadius: 12,
              padding: '12px 14px', marginBottom: 12, fontSize: 13, color: '#92400e', lineHeight: 1.55 }}>
              The business sent a counter offer. Check the conversation.
            </div>
            <div style={{ textAlign: 'center' }}>
              <span onClick={() => router.push(`/investor/chat/${matchId}`)}
                style={{ fontSize: 14, color: 'var(--forest)', textDecoration: 'underline', cursor: 'pointer' }}>
                Open conversation
              </span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <span onClick={() => router.push(`/investor/chat/${matchId}`)}
              style={{ fontSize: 14, color: 'var(--forest)', textDecoration: 'underline', cursor: 'pointer' }}>
              Open conversation
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
