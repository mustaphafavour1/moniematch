'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { acceptOffer, sendCounterOffer } from '@/lib/db'
import type { OfferTerms } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

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

// ─── Counter offer form ──────────────────────────────────────────────────────

interface CounterFormProps {
  offer: Record<string, unknown>
  offerId: string
  matchId: string
  onDone: () => void
}

function CounterOfferForm({ offer, offerId, matchId, onDone }: CounterFormProps) {
  const [amount,           setAmount]      = useState(String(offer.amount ?? ''))
  const [returnType,       setReturnType]  = useState((offer.return_type as string) || 'fixed')
  const [reporting,        setReporting]   = useState((offer.reporting_frequency as string) || 'monthly')
  const [totalReturn,      setTotalReturn] = useState(String(offer.total_return_amount ?? ''))
  const [roiPct,           setRoiPct]      = useState(String(offer.roi_percent ?? ''))
  const [revPct,           setRevPct]      = useState(String(offer.revenue_percent ?? ''))
  const [eqPct,            setEqPct]       = useState(String(offer.equity_percent ?? ''))
  const [notes,            setNotes]       = useState(String(offer.notes ?? ''))
  const [sending,          setSending]     = useState(false)
  const [sent,             setSent]        = useState(false)

  // Auto-compute ROI % from total return and amount
  function handleTotalReturn(val: string) {
    setTotalReturn(val)
    const a = parseFloat(amount)
    const t = parseFloat(val)
    if (a > 0 && t > 0) setRoiPct(String(Math.round(((t - a) / a) * 100)))
  }

  function handleRoi(val: string) {
    setRoiPct(val)
    const a = parseFloat(amount)
    const r = parseFloat(val)
    if (a > 0 && !isNaN(r)) setTotalReturn(String(Math.round(a * (1 + r / 100))))
  }

  async function handleSend() {
    setSending(true)
    try {
      const terms: OfferTerms = {
        amount:              parseFloat(amount) || 0,
        is_milestoned:       (offer.is_milestoned as boolean) || false,
        milestones:          (offer.milestones as OfferTerms['milestones']) || [],
        return_type:         returnType as OfferTerms['return_type'],
        reporting_frequency: reporting as OfferTerms['reporting_frequency'],
        total_return_amount: totalReturn ? parseFloat(totalReturn) : undefined,
        roi_percent:         roiPct     ? parseFloat(roiPct)      : undefined,
        revenue_percent:     revPct     ? parseFloat(revPct)      : undefined,
        equity_percent:      eqPct      ? parseFloat(eqPct)       : undefined,
        notes:               notes || undefined,
        parent_offer_id:     offerId,
      }
      await sendCounterOffer(offerId, matchId, terms)
      setSent(true)
      onDone()
    } finally {
      setSending(false)
    }
  }

  if (sent) return null

  const inputStyle: React.CSSProperties = {
    width: '100%',
    fontSize: 14,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--line)',
    background: 'var(--cream)',
    color: 'var(--ink)',
    outline: 'none',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--ink-3)',
    marginBottom: 6,
    display: 'block',
    fontWeight: 600,
  }
  const fieldStyle: React.CSSProperties = { marginBottom: 14 }

  return (
    <div style={{
      background: 'var(--bone)',
      borderRadius: 18,
      border: '1px solid var(--line)',
      padding: '20px 18px',
      marginBottom: 20,
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Counter offer terms</div>

      {/* Amount */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Amount</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 600 }}>₦</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="0"
          />
        </div>
      </div>

      {/* Return type */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Return type</label>
        <select value={returnType} onChange={e => setReturnType(e.target.value)} style={inputStyle}>
          <option value="fixed">Fixed returns</option>
          <option value="revenue_share">Revenue share</option>
          <option value="equity">Equity</option>
        </select>
      </div>

      {/* Reporting */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Reporting</label>
        <select value={reporting} onChange={e => setReporting(e.target.value)} style={inputStyle}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      {/* Total return + ROI (fixed / revenue_share) */}
      {(returnType === 'fixed' || returnType === 'revenue_share') && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Total return (₦)</label>
            <input
              type="number"
              value={totalReturn}
              onChange={e => handleTotalReturn(e.target.value)}
              style={inputStyle}
              placeholder="0"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ROI %</label>
            <input
              type="number"
              value={roiPct}
              onChange={e => handleRoi(e.target.value)}
              style={inputStyle}
              placeholder="0"
            />
          </div>
        </div>
      )}

      {/* Revenue share % */}
      {returnType === 'revenue_share' && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Revenue share %</label>
          <input
            type="number"
            value={revPct}
            onChange={e => setRevPct(e.target.value)}
            style={inputStyle}
            placeholder="0"
          />
        </div>
      )}

      {/* Equity % */}
      {returnType === 'equity' && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Equity %</label>
          <input
            type="number"
            value={eqPct}
            onChange={e => setEqPct(e.target.value)}
            style={inputStyle}
            placeholder="0"
          />
        </div>
      )}

      {/* Notes */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          placeholder="Add any notes…"
        />
      </div>

      <button
        className="btn btn-forest btn-block"
        onClick={handleSend}
        disabled={sending}
      >
        {sending ? 'Sending…' : 'Send counter offer'}
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BizOfferViewPage() {
  const router       = useRouter()
  const params       = useParams()
  const searchParams = useSearchParams()
  const matchId      = params.matchId as string
  const offerId      = searchParams.get('offerId') || ''
  const mode         = searchParams.get('mode') || 'view'

  const [offer,         setOffer]         = useState<Record<string, unknown> | null>(null)
  const [myId,          setMyId]          = useState<string | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [accepted,      setAccepted]      = useState(false)
  const [counterSent,   setCounterSent]   = useState(false)
  const [accepting,     setAccepting]     = useState(false)

  useEffect(() => {
    if (!offerId) return
    Promise.all([
      supabase.from('offers')
        .select('*, matches(businesses(name), investors(users(name)))')
        .eq('id', offerId)
        .maybeSingle(),
      supabase.auth.getUser(),
    ]).then(([{ data }, { data: { user } }]) => {
      setOffer(data as Record<string, unknown>)
      setMyId(user?.id ?? null)
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

  const statusKey   = offer.status as string
  const status      = STATUS_LABEL[statusKey] || STATUS_LABEL.pending
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matches     = offer.matches as any
  const bizName     = matches?.businesses?.name       || 'Business'
  const investorName= matches?.investors?.users?.name || 'Investor'
  const returnType  = offer.return_type as string
  const milestones  = (offer.milestones as { amount: number; description: string }[] | null) || []

  const isProposer  = offer.proposer_id === myId
  const isAccepted  = accepted || statusKey === 'accepted' || statusKey === 'offer_accepted'

  // Chip grid rows
  const chipRows: [string, string][][] = []
  const row1: [string, string][] = []
  if (returnType)                   row1.push(['Return type', RETURN_LABEL[returnType] || returnType])
  if (offer.reporting_frequency)    row1.push(['Reporting',   offer.reporting_frequency as string])
  if (row1.length) chipRows.push(row1)

  const row2: [string, string][] = []
  if (offer.total_return_amount || offer.roi_percent) {
    const parts = []
    if (offer.total_return_amount) parts.push(fmtN(offer.total_return_amount as number))
    if (offer.roi_percent)         parts.push(`${offer.roi_percent}%`)
    row2.push(['Total return', parts.join(' ')])
  }
  if (offer.revenue_percent) row2.push(['Revenue share', `${offer.revenue_percent}% / month`])
  if (offer.equity_percent)  row2.push(['Equity stake',  `${offer.equity_percent}%`])
  if (row2.length) chipRows.push(row2)

  async function handleAccept() {
    setAccepting(true)
    try {
      await acceptOffer(offerId, matchId)
      setAccepted(true)
    } finally {
      setAccepting(false)
    }
  }

  const openConvLink = (
    <div style={{ textAlign: 'center' }}>
      <span
        onClick={() => router.push(`/business/chat/${matchId}`)}
        style={{ fontSize: 14, color: 'var(--forest)', textDecoration: 'underline', cursor: 'pointer' }}
      >
        Open conversation
      </span>
    </div>
  )

  // Determine bottom action content
  let bottomContent: React.ReactNode = openConvLink

  if (mode === 'view') {
    if (isAccepted) {
      bottomContent = (
        <div style={{
          background: '#ecfdf5', border: '1px solid #a7f3d0',
          borderRadius: 12, padding: '12px 14px',
          fontSize: 13, color: '#065f46', lineHeight: 1.55,
        }}>
          Offer accepted! The investor will be notified to proceed to payment.
        </div>
      )
    } else if (!isProposer && statusKey === 'pending') {
      bottomContent = (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={{
              flex: 1,
              padding: '13px 0',
              borderRadius: 12,
              border: '1px solid var(--ink)',
              background: 'transparent',
              color: 'var(--ink)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => router.push(`/business/chat/${matchId}/offer-view?offerId=${offerId}&mode=counter`)}
          >
            Counter offer
          </button>
          <button
            className="btn btn-forest"
            style={{ flex: 1, padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? 'Accepting…' : 'Accept offer'}
          </button>
        </div>
      )
    } else if (isProposer) {
      bottomContent = openConvLink
    }
  } else {
    // counter mode — bottom button is inside CounterOfferForm
    bottomContent = null
  }

  const pageTitle = mode === 'counter' ? 'Counter offer' : 'Offer'

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title={pageTitle}
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      {/* Scrollable body */}
      <div className="scroll" style={{ flex: 1, padding: '16px 20px 24px' }}>

        {/* Counter sent success */}
        {counterSent && (
          <div style={{
            background: '#ecfdf5', border: '1px solid #a7f3d0',
            borderRadius: 12, padding: '12px 14px', marginBottom: 20,
            fontSize: 13, color: '#065f46', lineHeight: 1.55,
          }}>
            Counter offer sent!
          </div>
        )}

        {/* Counter offer form (mode=counter) */}
        {mode === 'counter' && !counterSent && (
          <CounterOfferForm
            offer={offer}
            offerId={offerId}
            matchId={matchId}
            onDone={() => setCounterSent(true)}
          />
        )}

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
              {fmtN(offer.amount as number)}
            </div>
          </div>

          {/* Milestones */}
          {offer.is_milestoned && milestones.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8, fontWeight: 600 }}>Milestones</div>
              {milestones.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 13, color: 'var(--ink)', marginBottom: 6,
                }}>
                  <span>{m.description || `Milestone ${i + 1}`}</span>
                  <span style={{ fontWeight: 600 }}>{fmtN(m.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Detail chips */}
          {chipRows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {row.map(([label, value]) => (
                <Chip key={label} label={label} value={value} />
              ))}
            </div>
          ))}
        </div>

        {/* Notes */}
        {offer.notes && (
          <div style={{
            background: 'var(--bone)',
            borderRadius: 12,
            border: '1px solid var(--line)',
            padding: '14px 16px',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6, fontWeight: 600 }}>Notes</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{offer.notes as string}</div>
          </div>
        )}

        {/* When counter sent, show open conversation link inline */}
        {counterSent && (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span
              onClick={() => router.push(`/business/chat/${matchId}`)}
              style={{ fontSize: 14, color: 'var(--forest)', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Open conversation
            </span>
          </div>
        )}
      </div>

      {/* Bottom action area — sticky */}
      {(bottomContent !== null || (mode === 'counter' && !counterSent)) && (
        <div style={{
          padding: '12px 20px 32px',
          borderTop: '1px solid var(--line)',
          background: 'var(--cream)',
        }}>
          {bottomContent}
        </div>
      )}
    </div>
  )
}
