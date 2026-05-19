'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { checkBizContractReadiness, acceptOfferWithContract, getDealForOffer, sendCounterOffer } from '@/lib/db'
import type { OfferTerms } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

// ─── Typed offer data ────────────────────────────────────────────────────────

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
  has_voting_rights: boolean | null
  monthly_payment: number | null
  end_date: string | null
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
      background: 'var(--cream)', borderRadius: 12, border: '1px solid var(--line)',
      padding: '10px 12px', flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
    </div>
  )
}

// ─── Counter offer form ──────────────────────────────────────────────────────

interface CounterFormProps {
  offer: OfferData
  offerId: string
  matchId: string
  onDone: () => void
}

function CounterOfferForm({ offer, offerId, matchId, onDone }: CounterFormProps) {
  const [amount,      setAmount]      = useState(String(offer.amount))
  const [returnType,  setReturnType]  = useState(offer.return_type || 'fixed')
  const [reporting,   setReporting]   = useState(offer.reporting_frequency || 'monthly')
  const [totalReturn, setTotalReturn] = useState(String(offer.total_return_amount ?? ''))
  const [roiPct,      setRoiPct]      = useState(String(offer.return_rate ?? ''))
  const [revPct,      setRevPct]      = useState(String(offer.revenue_percent ?? ''))
  const [eqPct,       setEqPct]       = useState(String(offer.equity_percent ?? ''))
  const [notes,       setNotes]       = useState(offer.notes ?? '')
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)

  function handleTotalReturn(val: string) {
    setTotalReturn(val)
    const a = parseFloat(amount); const t = parseFloat(val)
    if (a > 0 && t > 0) setRoiPct(String(Math.round(((t - a) / a) * 100)))
  }
  function handleRoi(val: string) {
    setRoiPct(val)
    const a = parseFloat(amount); const r = parseFloat(val)
    if (a > 0 && !isNaN(r)) setTotalReturn(String(Math.round(a * (1 + r / 100))))
  }

  async function handleSend() {
    setSending(true)
    try {
      const terms: OfferTerms = {
        amount:              parseFloat(amount) || 0,
        is_milestoned:       offer.is_milestoned,
        milestones:          offer.milestones ?? [],
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
    width: '100%', fontSize: 14, padding: '10px 12px', borderRadius: 10,
    border: '1px solid var(--line)', background: 'var(--cream)', color: 'var(--ink)',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, color: 'var(--ink-3)', marginBottom: 6, display: 'block', fontWeight: 600,
  }
  const fieldStyle: React.CSSProperties = { marginBottom: 14 }

  return (
    <div style={{
      background: 'var(--bone)', borderRadius: 18, border: '1px solid var(--line)',
      padding: '20px 18px', marginBottom: 20,
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>Counter offer terms</div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Amount</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 600 }}>₦</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ ...inputStyle, flex: 1 }} placeholder="0" />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Return type</label>
        <select value={returnType} onChange={e => setReturnType(e.target.value)} style={inputStyle}>
          <option value="fixed">Fixed returns</option>
          <option value="revenue_share">Revenue share</option>
          <option value="equity">Equity</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Reporting</label>
        <select value={reporting} onChange={e => setReporting(e.target.value)} style={inputStyle}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      {(returnType === 'fixed' || returnType === 'revenue_share') ? (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Total return (₦)</label>
            <input type="number" value={totalReturn} onChange={e => handleTotalReturn(e.target.value)}
              style={inputStyle} placeholder="0" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ROI %</label>
            <input type="number" value={roiPct} onChange={e => handleRoi(e.target.value)}
              style={inputStyle} placeholder="0" />
          </div>
        </div>
      ) : null}

      {returnType === 'revenue_share' ? (
        <div style={fieldStyle}>
          <label style={labelStyle}>Revenue share %</label>
          <input type="number" value={revPct} onChange={e => setRevPct(e.target.value)}
            style={inputStyle} placeholder="0" />
        </div>
      ) : null}

      {returnType === 'equity' ? (
        <div style={fieldStyle}>
          <label style={labelStyle}>Equity %</label>
          <input type="number" value={eqPct} onChange={e => setEqPct(e.target.value)}
            style={inputStyle} placeholder="0" />
        </div>
      ) : null}

      <div style={fieldStyle}>
        <label style={labelStyle}>Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Add any notes…" />
      </div>

      <button className="btn btn-forest btn-block" onClick={handleSend} disabled={sending}>
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
  const offerId      = searchParams.get('offerId') ?? ''
  const mode         = searchParams.get('mode') ?? 'view'

  const [offer,              setOffer]              = useState<OfferData | null>(null)
  const [myId,               setMyId]               = useState('')
  const [loading,            setLoading]            = useState(true)
  const [accepted,           setAccepted]           = useState(false)
  const [counterSent,        setCounterSent]        = useState(false)
  const [accepting,          setAccepting]          = useState(false)
  const [readinessErr,       setReadinessErr]       = useState<string[]>([])
  const [dealInfo,           setDealInfo]           = useState<{ dealId: string; contractId: string | null; paymentConfirmedAt: string | null; invSignedAt: string | null } | null>(null)

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
      const statusKey = (data as OfferData | null)?.status
      if (statusKey === 'accepted' || statusKey === 'offer_accepted') {
        getDealForOffer(offerId).then(d => {
          if (d) setDealInfo({ dealId: d.dealId, contractId: d.contractId, paymentConfirmedAt: d.paymentConfirmedAt, invSignedAt: d.invSignedAt })
        })
      }
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

  // All values extracted with proper types — no unknown leaks into JSX
  const statusKey    = offer.status
  const status       = STATUS_LABEL[statusKey] ?? STATUS_LABEL.pending
  const bizName      = offer.matches?.businesses?.name ?? 'Business'
  const investorName = offer.matches?.investors?.users?.name ?? 'Investor'
  const milestones   = offer.milestones ?? []
  const isProposer   = offer.proposer_id === myId
  const isAccepted   = accepted || statusKey === 'accepted' || statusKey === 'offer_accepted'

  // Build chip rows from typed fields
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

  async function handleAccept() {
    setAccepting(true)
    try {
      const { ready, missing } = await checkBizContractReadiness()
      if (!ready) {
        setReadinessErr(missing)
        setAccepting(false)
        return
      }
      // Get business user signature from storage
      const { data: { user } } = await supabase.auth.getUser()
      let bizSigBase64 = ''
      if (user) {
        try {
          const { data: sigUrl } = await supabase.storage.from('signatures').createSignedUrl(`${user.id}/signature.png`, 60)
          if (sigUrl?.signedUrl) {
            const resp = await fetch(sigUrl.signedUrl)
            const blob = await resp.blob()
            bizSigBase64 = await new Promise<string>((res, rej) => {
              const reader = new FileReader()
              reader.onloadend = () => res(reader.result as string)
              reader.onerror = rej
              reader.readAsDataURL(blob)
            })
          }
        } catch { /* sig fetch failed; proceed without */ }
      }
      const result = await acceptOfferWithContract(offerId, matchId, bizSigBase64)
      setDealInfo({ dealId: result.dealId, contractId: result.contractId, paymentConfirmedAt: null, invSignedAt: null })
      setAccepted(true)
    } catch (e: unknown) {
      setReadinessErr([e instanceof Error ? e.message : 'Something went wrong. Please try again.'])
    } finally {
      setAccepting(false)
    }
  }

  const openConvLink = (
    <div style={{ textAlign: 'center' }}>
      <span onClick={() => router.push(`/business/chat/${matchId}`)}
        style={{ fontSize: 14, color: 'var(--forest)', textDecoration: 'underline', cursor: 'pointer' }}>
        Open conversation
      </span>
    </div>
  )

  let bottomContent: React.ReactNode = openConvLink
  if (mode === 'view') {
    if (isAccepted && !dealInfo) {
      // Accepted with old code — no deal/contract row yet; business must generate it
      bottomContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#78350f', lineHeight: 1.55 }}>
            Agreement not generated yet. Please sign and generate the agreement document so the investor can proceed to payment.
          </div>
          <button className="btn btn-forest btn-block" onClick={handleAccept} disabled={accepting}>
            {accepting ? 'Generating…' : 'Sign & generate agreement →'}
          </button>
        </div>
      )
    } else if (isAccepted) {
      bottomContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#065f46', lineHeight: 1.55 }}>
            Offer accepted! You have signed the agreement. Waiting for investor to pay and sign.
          </div>
          {dealInfo?.contractId && (
            <button onClick={() => router.push(`/business/chat/${matchId}/contract?contractId=${dealInfo.contractId}`)}
              style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1px solid var(--line-strong)', background: 'transparent', color: 'var(--ink)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              View agreement
            </button>
          )}
          {dealInfo?.paymentConfirmedAt && (
            <div style={{ padding: '10px 14px', background: '#ecfdf5', borderRadius: 10, fontSize: 13, color: '#065f46' }}>
              ✓ Payment received
            </div>
          )}
        </div>
      )
    } else if (!isProposer && (statusKey === 'pending' || statusKey === 'countered')) {
      bottomContent = (
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: '1px solid var(--ink)',
            background: 'transparent', color: 'var(--ink)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => router.push(`/business/chat/${matchId}/offer-view?offerId=${offerId}&mode=counter`)}>
            Counter offer
          </button>
          <button className="btn btn-forest"
            style={{ flex: 1, padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            onClick={handleAccept} disabled={accepting}>
            {accepting ? 'Accepting…' : 'Accept offer'}
          </button>
        </div>
      )
    } else if (isProposer) {
      bottomContent = openConvLink
    }
  } else {
    bottomContent = null
  }

  const showBottomBar = bottomContent !== null || (mode === 'counter' && !counterSent)

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title={mode === 'counter' ? 'Counter offer' : 'Offer'}
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '16px 20px 24px' }}>

        {counterSent ? (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12,
            padding: '12px 14px', marginBottom: 20, fontSize: 13, color: '#065f46', lineHeight: 1.55 }}>
            Counter offer sent!
          </div>
        ) : null}

        {mode === 'counter' && !counterSent ? (
          <CounterOfferForm
            offer={offer}
            offerId={offerId}
            matchId={matchId}
            onDone={() => setCounterSent(true)}
          />
        ) : null}

        {/* Preview card */}
        <div style={{ background: 'var(--bone)', borderRadius: 18, border: '1px solid var(--line)',
          padding: '20px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 2 }}>Offer to</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{bizName}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>From {investorName}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: status.color, background: status.bg,
              borderRadius: 999, padding: '4px 11px', whiteSpace: 'nowrap', marginTop: 2 }}>
              {status.label}
            </span>
          </div>

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

          {chipRows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {row.map(([label, value]) => <Chip key={label} label={label} value={value} />)}
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

        {counterSent ? (
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span onClick={() => router.push(`/business/chat/${matchId}`)}
              style={{ fontSize: 14, color: 'var(--forest)', textDecoration: 'underline', cursor: 'pointer' }}>
              Open conversation
            </span>
          </div>
        ) : null}
      </div>

      {readinessErr.length > 0 && (
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#78350f', marginBottom: 6 }}>
              Complete your contract information first
            </div>
            <ul style={{ margin: '0 0 10px 16px', padding: 0, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              {readinessErr.map(m => <li key={m}>{m}</li>)}
            </ul>
            <button onClick={() => router.push('/business/contracts')}
              style={{ fontSize: 13, color: '#78350f', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
              Go to Contract Information →
            </button>
          </div>
        </div>
      )}

      {showBottomBar ? (
        <div style={{ padding: '12px 20px 32px', borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
          {bottomContent}
        </div>
      ) : null}
    </div>
  )
}
