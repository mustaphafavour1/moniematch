'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { saveOffer, getMatchCounterpartyName, getMyTemplates } from '@/lib/db'
import type { OfferTerms, InvestorOffer } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtNaira = (n: number) => '₦' + n.toLocaleString('en-NG')

function commaVal(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('en-NG')
}

function unformat(s: string): number {
  return Number(s.replace(/\D/g, '')) || 0
}

// ── Types ────────────────────────────────────────────────────────────────────

type Step = 'amount' | 'return' | 'preview' | 'sent'
type ReturnType = 'fixed' | 'revenue_share' | 'equity'
type ReportingFreq = 'weekly' | 'monthly' | 'quarterly'

interface MilestoneRow { amount: string }

// ── Sub-components ───────────────────────────────────────────────────────────

function TogglePill({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {(['Yes', 'No'] as const).map(opt => {
        const isYes  = opt === 'Yes'
        const active = value === isYes
        return (
          <button key={opt} onClick={() => onChange(isYes)} style={{
            padding: '7px 18px', borderRadius: 999, border: '1.5px solid',
            borderColor: active ? 'var(--ink)' : 'var(--line)',
            background: active ? 'var(--ink)' : 'var(--bone)',
            color: active ? 'var(--cream)' : 'var(--ink)',
            fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 8px' }}>
      {children}
    </p>
  )
}

function Field({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, prefix, type = 'text', style }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  prefix?: string; type?: string; style?: React.CSSProperties
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--bone)', border: '1px solid var(--line-strong)',
      borderRadius: 12, padding: '11px 14px', gap: 6, minWidth: 0, width: '100%', ...style,
    }}>
      {prefix && <span style={{ fontSize: 15, color: 'var(--ink-3)', flexShrink: 0 }}>{prefix}</span>}
      <input value={value} type={type} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none',
          fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)' }} />
    </div>
  )
}

function PrimaryBtn({ onClick, disabled, children }: {
  onClick: () => void; disabled?: boolean; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: 14, borderRadius: 999, border: 'none',
      background: disabled ? 'var(--linen)' : 'var(--ink)',
      color: disabled ? 'var(--ink-4)' : 'var(--cream)',
      fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 180ms',
    }}>
      {children}
    </button>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function InvOfferPage() {
  const router  = useRouter()
  const params  = useParams()
  const matchId = params.matchId as string

  const [step,           setStep]           = useState<Step>('amount')
  const [counterparty,   setCounterparty]   = useState('')
  const [saving,         setSaving]         = useState(false)
  const [saveError,      setSaveError]      = useState('')
  const [templates,      setTemplates]      = useState<InvestorOffer[]>([])
  const [showTemplates,  setShowTemplates]  = useState(false)

  // ── Amount step state
  const [amountRaw,      setAmountRaw]      = useState('')
  const [milestoned,     setMilestoned]     = useState(false)
  const [numMilestones,  setNumMilestones]  = useState('2')
  const [equalAmounts,   setEqualAmounts]   = useState(true)
  const [milestones,     setMilestones]     = useState<MilestoneRow[]>([{ amount: '' }, { amount: '' }])

  // ── Return step state
  const [returnType,     setReturnType]     = useState<ReturnType>('fixed')
  const [frequency,      setFrequency]      = useState<ReportingFreq>('monthly')
  // Fixed / Revenue share
  const [totalReturnRaw, setTotalReturnRaw] = useState('')
  const [roiPct,         setRoiPct]         = useState('')
  const [monthlyPayRaw,  setMonthlyPayRaw]  = useState('')
  const [endDate,        setEndDate]        = useState('')
  // Revenue share
  const [revPct,         setRevPct]         = useState('')
  // Equity
  const [equityPct,      setEquityPct]      = useState('')
  const [votingRights,   setVotingRights]   = useState(false)
  // Notes
  const [notes,          setNotes]          = useState('')
  // Template
  const [saveTemplate,   setSaveTemplate]   = useState(false)
  const [templateName,   setTemplateName]   = useState('')

  useEffect(() => {
    getMatchCounterpartyName(matchId, 'investor').then(setCounterparty)
    getMyTemplates().then(setTemplates)
  }, [matchId])

  // ── Derived values
  const investmentAmount = unformat(amountRaw)

  // Auto-calc ROI <-> Total return
  const handleTotalReturnChange = (raw: string) => {
    const formatted = commaVal(raw)
    setTotalReturnRaw(formatted)
    if (investmentAmount > 0) {
      const total = unformat(formatted)
      if (total > 0) setRoiPct(((total / investmentAmount - 1) * 100).toFixed(1))
      else setRoiPct('')
    }
  }
  const handleRoiChange = (v: string) => {
    setRoiPct(v)
    if (investmentAmount > 0) {
      const pct = parseFloat(v) || 0
      if (pct > 0) setTotalReturnRaw(commaVal(String(Math.round(investmentAmount * (1 + pct / 100)))))
      else setTotalReturnRaw('')
    }
  }

  // Auto-calc monthly payment <-> end date
  const handleMonthlyPayChange = (raw: string) => {
    setMonthlyPayRaw(commaVal(raw))
    // no auto-calc end date from monthly pay alone without a total
  }
  const handleEndDateChange = (v: string) => {
    setEndDate(v)
    const total = unformat(totalReturnRaw)
    if (total > 0 && v) {
      const now    = new Date()
      const end    = new Date(v + '-01')
      const months = Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()))
      setMonthlyPayRaw(commaVal(String(Math.round(total / months))))
    }
  }

  // Milestone sync when count changes
  const handleNumMilestones = (v: string) => {
    const n = Math.min(5, Math.max(1, parseInt(v) || 1))
    setNumMilestones(String(n))
    setMilestones(prev => {
      const next = [...prev]
      while (next.length < n) next.push({ amount: '' })
      return next.slice(0, n)
    })
  }

  // ── Step validation
  const amountValid = investmentAmount > 0
  const returnValid = returnType === 'equity'
    ? (parseFloat(equityPct) > 0 && parseFloat(equityPct) <= 100)
    : unformat(totalReturnRaw) >= investmentAmount

  // ── Build OfferTerms
  function buildTerms(): OfferTerms {
    const base: OfferTerms = {
      amount:              investmentAmount,
      is_milestoned:       milestoned,
      return_type:         returnType,
      reporting_frequency: frequency,
      notes:               notes || undefined,
      is_template:         saveTemplate || undefined,
      template_name:       saveTemplate ? templateName : undefined,
    }
    if (milestoned && !equalAmounts) {
      base.milestones = milestones.map((m, i) => ({ amount: unformat(m.amount), description: `Milestone ${i + 1}` }))
    } else if (milestoned && equalAmounts) {
      const each = Math.round(investmentAmount / milestones.length)
      base.milestones = milestones.map((_, i) => ({ amount: each, description: `Milestone ${i + 1}` }))
    }
    if (returnType === 'fixed' || returnType === 'revenue_share') {
      base.total_return_amount = unformat(totalReturnRaw) || undefined
      base.roi_percent         = parseFloat(roiPct) || undefined
    }
    if (returnType === 'fixed') {
      base.repayment_method = monthlyPayRaw ? 'monthly_payment' : endDate ? 'end_date' : undefined
      base.monthly_payment  = unformat(monthlyPayRaw) || undefined
      base.end_date         = endDate || undefined
    }
    if (returnType === 'revenue_share') {
      base.revenue_percent = parseFloat(revPct) || undefined
    }
    if (returnType === 'equity') {
      base.equity_percent  = parseFloat(equityPct) || undefined
      base.has_voting_rights = votingRights
    }
    return base
  }

  function loadTemplate(t: InvestorOffer) {
    if (t.amount) setAmountRaw(t.amount.toLocaleString('en-NG'))
    if (t.is_milestoned !== undefined) setMilestoned(t.is_milestoned)
    if (t.milestones?.length) {
      setNumMilestones(String(t.milestones.length))
      setMilestones(t.milestones.map(m => ({ amount: m.amount.toLocaleString('en-NG') })))
      setEqualAmounts(false)
    }
    if (t.return_type) setReturnType(t.return_type as ReturnType)
    if (t.reporting_frequency) setFrequency(t.reporting_frequency as ReportingFreq)
    if (t.total_return_amount) setTotalReturnRaw(t.total_return_amount.toLocaleString('en-NG'))
    if (t.roi_percent) setRoiPct(String(t.roi_percent))
    if (t.revenue_percent) setRevPct(String(t.revenue_percent))
    if (t.equity_percent) setEquityPct(String(t.equity_percent))
    if (t.has_voting_rights !== undefined) setVotingRights(t.has_voting_rights)
    if (t.notes) setNotes(t.notes)
    setShowTemplates(false)
  }

  const handleSendOffer = async () => {
    if (saving) return
    setSaving(true)
    setSaveError('')
    try {
      await saveOffer(matchId, buildTerms())
      setStep('sent')
    } catch {
      setSaveError('Could not send offer. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Render helpers
  const RETURN_CARDS: { type: ReturnType; label: string; sub: string; icon: string }[] = [
    { type: 'fixed',         label: 'Fixed returns',  sub: 'Set repayment amount + schedule', icon: 'money'   },
    { type: 'revenue_share', label: 'Revenue share',  sub: 'Earn % of monthly revenue',       icon: 'chart'   },
    { type: 'equity',        label: 'Equity',          sub: 'Ownership stake in the business', icon: 'shield'  },
  ]

  const FREQ_OPTIONS: { value: ReportingFreq; label: string }[] = [
    { value: 'monthly',   label: 'Monthly'    },
    { value: 'quarterly', label: 'Quarterly'  },
    { value: 'weekly',    label: 'Weekly'     },
  ]

  // ── STEP: amount ─────────────────────────────────────────────────────────────
  if (step === 'amount') return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Make an offer"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      {templates.length > 0 && (
        <div style={{ padding: '0 16px 4px', marginBottom: 4 }}>
          <button onClick={() => setShowTemplates(true)} style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 13, color: 'var(--forest)', fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            Use a saved template <span style={{ fontSize: 16 }}>→</span>
          </button>
        </div>
      )}
      <div className="scroll" style={{ flex: 1, padding: '24px 16px 32px' }}>
        <Field>
          <Label>Investment amount</Label>
          <div style={{
            background: 'var(--bone)', border: '1px solid var(--line-strong)',
            borderRadius: 14, padding: '16px 18px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink-3)' }}>₦</span>
            <input
              value={amountRaw}
              onChange={e => setAmountRaw(commaVal(e.target.value))}
              placeholder="0"
              inputMode="numeric"
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)',
              }}
            />
          </div>
          {investmentAmount > 0 && (
            <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 5, textAlign: 'right' }}>
              {fmtNaira(investmentAmount)}
            </p>
          )}
        </Field>

        <Field>
          <Label>Break into milestones?</Label>
          <TogglePill value={milestoned} onChange={setMilestoned} />
        </Field>

        {milestoned && (
          <>
            <Field>
              <Label>Number of milestones (1–5)</Label>
              <TextInput value={numMilestones} onChange={handleNumMilestones} placeholder="2" type="number" />
            </Field>

            <Field>
              <Label>Equal amounts?</Label>
              <TogglePill value={equalAmounts} onChange={setEqualAmounts} />
            </Field>

            {!equalAmounts && (
              <Field>
                <Label>Milestone amounts</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {milestones.map((m, i) => (
                    <div key={i}>
                      <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Milestone {i + 1}</p>
                      <TextInput
                        value={m.amount}
                        onChange={v => {
                          const next = [...milestones]
                          next[i] = { amount: commaVal(v) }
                          setMilestones(next)
                        }}
                        placeholder="₦0"
                        prefix="₦"
                      />
                    </div>
                  ))}
                </div>
              </Field>
            )}

            {equalAmounts && investmentAmount > 0 && (
              <div style={{
                background: 'var(--bone)', border: '1px solid var(--line)',
                borderRadius: 12, padding: '12px 14px', marginBottom: 20,
              }}>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
                  {milestones.length} milestones × {fmtNaira(Math.round(investmentAmount / milestones.length))} each
                </p>
              </div>
            )}
          </>
        )}

        <PrimaryBtn onClick={() => setStep('return')} disabled={!amountValid}>
          Continue
        </PrimaryBtn>
      </div>
      {showTemplates && (
        <>
          <div onClick={() => setShowTemplates(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(31,26,20,0.45)', zIndex: 199 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 'max(0px, calc(50vw - 195px))', right: 'max(0px, calc(50vw - 195px))', zIndex: 200, background: 'var(--cream)', borderRadius: '20px 20px 0 0', padding: '0 0 env(safe-area-inset-bottom, 32px)', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--line-strong)' }} />
            </div>
            <div style={{ padding: '4px 20px 12px', fontFamily: 'var(--font-display)', fontSize: 17 }}>Saved templates</div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
              {templates.map(t => (
                <div key={t.id} onClick={() => loadTemplate(t)} style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--bone)', border: '1px solid var(--line)', marginBottom: 10, cursor: 'pointer' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{t.template_name || 'Unnamed template'}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {t.amount ? `₦${t.amount.toLocaleString('en-NG')}` : '—'} · {t.return_type?.replace('_', ' ')}
                  </div>
                </div>
              ))}
              <button onClick={() => setShowTemplates(false)} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--line)', background: 'none', fontSize: 14, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 4 }}>
                Start from scratch
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )

  // ── STEP: return ─────────────────────────────────────────────────────────────
  if (step === 'return') return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Return structure"
        leading={<RoundBtn onClick={() => setStep('amount')}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      <div className="scroll" style={{ flex: 1, padding: '20px 16px 32px' }}>

        {/* Offer amount reminder */}
        <div style={{ background: 'var(--linen)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Offer amount</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{fmtNaira(investmentAmount)}</span>
        </div>

        {/* Return type cards */}
        <Field>
          <Label>Return type</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RETURN_CARDS.map(card => (
              <div key={card.type} onClick={() => setReturnType(card.type)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--bone)', border: '1.5px solid',
                borderColor: returnType === card.type ? 'var(--ink)' : 'var(--line)',
                borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                transition: 'border-color 150ms',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: returnType === card.type ? 'var(--ink)' : 'var(--linen)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={card.icon} size={18} color={returnType === card.type ? 'var(--cream)' : 'var(--ink-2)'} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{card.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '2px 0 0' }}>{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Field>

        {/* Reporting frequency */}
        <Field>
          <Label>Reporting frequency</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            {FREQ_OPTIONS.map(f => (
              <button key={f.value} onClick={() => setFrequency(f.value)} style={{
                flex: 1, padding: '9px 0', borderRadius: 999, border: '1.5px solid',
                borderColor: frequency === f.value ? 'var(--ink)' : 'var(--line)',
                background: frequency === f.value ? 'var(--ink)' : 'var(--bone)',
                color: frequency === f.value ? 'var(--cream)' : 'var(--ink)',
                fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Conditional fields */}
        {(returnType === 'fixed' || returnType === 'revenue_share') && (
          <>
            <Field>
              <Label>Return amount</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Total (₦)</p>
                  <TextInput value={totalReturnRaw} onChange={handleTotalReturnChange} placeholder="0" prefix="₦" />
                </div>
                <span style={{ fontSize: 12, color: 'var(--ink-4)', paddingTop: 18 }}>↔</span>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>ROI %</p>
                  <TextInput value={roiPct} onChange={handleRoiChange} placeholder="0" prefix="%" />
                </div>
              </div>
            </Field>
            {(returnType === 'fixed' || returnType === 'revenue_share') && unformat(totalReturnRaw) > 0 && unformat(totalReturnRaw) < investmentAmount && (
              <p style={{ fontSize: 12, color: '#C0392B', marginTop: -12, marginBottom: 16 }}>
                Total return must be at least {fmtNaira(investmentAmount)} (the offer amount)
              </p>
            )}
          </>
        )}

        {returnType === 'fixed' && (
          <Field>
            <Label>Repayment schedule</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>Monthly payment (₦)</p>
                <TextInput value={monthlyPayRaw} onChange={handleMonthlyPayChange} placeholder="0" prefix="₦" />
              </div>
              <span style={{ fontSize: 11, color: 'var(--ink-4)', paddingTop: 18 }}>or</span>
              <div>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>End date</p>
                <TextInput value={endDate} onChange={handleEndDateChange} type="month" />
              </div>
            </div>
          </Field>
        )}

        {returnType === 'revenue_share' && (
          <Field>
            <Label>% of monthly revenue</Label>
            <TextInput value={revPct} onChange={setRevPct} placeholder="e.g. 15" prefix="%" />
          </Field>
        )}

        {returnType === 'equity' && (
          <>
            <Field>
              <Label>Equity %</Label>
              <TextInput value={equityPct} onChange={setEquityPct} placeholder="e.g. 10" prefix="%" />
            </Field>
            <Field>
              <Label>Voting rights?</Label>
              <TogglePill value={votingRights} onChange={setVotingRights} />
            </Field>
          </>
        )}

        {/* Notes */}
        <Field>
          <Label>Additional notes (optional)</Label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any conditions, expectations, or context…"
            rows={3}
            style={{
              width: '100%', borderRadius: 12, border: '1px solid var(--line-strong)',
              background: 'var(--bone)', padding: '11px 14px', resize: 'none',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
              outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
            }}
          />
        </Field>

        <PrimaryBtn onClick={() => setStep('preview')} disabled={!returnValid}>
          Preview offer
        </PrimaryBtn>
      </div>
    </div>
  )

  // ── STEP: preview ────────────────────────────────────────────────────────────
  if (step === 'preview') {
    const terms = buildTerms()
    const roiVal = terms.roi_percent ? `${terms.roi_percent}%` : ''
    const totalRet = terms.total_return_amount ? fmtNaira(terms.total_return_amount) : ''

    return (
      <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <AppHeader
          title="Preview offer"
          leading={<RoundBtn onClick={() => setStep('return')}><Icon name="back" size={18} /></RoundBtn>}
          sticky
        />
        <div className="scroll" style={{ flex: 1, padding: '20px 16px 32px' }}>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14 }}>
            This is how your offer will appear to {counterparty || 'the business'}.
          </p>

          {/* Offer card */}
          <div style={{
            background: 'var(--bone)', border: '1px solid var(--line)',
            borderRadius: 18, padding: '20px 18px', marginBottom: 16,
          }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>Offer to</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--ink)', margin: '2px 0 0' }}>
                  {counterparty || '—'}
                </p>
              </div>
              <div style={{
                background: 'var(--linen)', borderRadius: 8, padding: '4px 10px',
                fontSize: 12, color: 'var(--ink-2)', fontWeight: 600,
              }}>
                Pending
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 2px' }}>Investment</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', margin: 0 }}>
                {fmtNaira(investmentAmount)}
              </p>
            </div>

            {/* Milestones */}
            {terms.is_milestoned && terms.milestones && terms.milestones.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 8px' }}>Milestones</p>
                {terms.milestones.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '6px 0', borderBottom: '1px solid var(--line)',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{m.description}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{fmtNaira(m.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Return */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div style={{ background: 'var(--linen)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px' }}>Return type</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                  {terms.return_type === 'fixed' ? 'Fixed' : terms.return_type === 'revenue_share' ? 'Revenue share' : 'Equity'}
                </p>
              </div>
              <div style={{ background: 'var(--linen)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px' }}>Reporting</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0, textTransform: 'capitalize' }}>
                  {terms.reporting_frequency}
                </p>
              </div>
              {(totalRet || roiVal) && (
                <div style={{ background: 'var(--linen)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px' }}>Total return</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                    {totalRet}{roiVal ? ` (${roiVal})` : ''}
                  </p>
                </div>
              )}
              {terms.return_type === 'fixed' && terms.monthly_payment && (
                <div style={{ background: 'var(--linen)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px' }}>Monthly payment</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{fmtNaira(terms.monthly_payment)}</p>
                </div>
              )}
              {terms.return_type === 'fixed' && terms.end_date && (
                <div style={{ background: 'var(--linen)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px' }}>End date</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{terms.end_date}</p>
                </div>
              )}
              {terms.return_type === 'revenue_share' && terms.revenue_percent && (
                <div style={{ background: 'var(--linen)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px' }}>Revenue share</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>{terms.revenue_percent}% / month</p>
                </div>
              )}
              {terms.return_type === 'equity' && terms.equity_percent && (
                <div style={{ background: 'var(--linen)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px' }}>Equity stake</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                    {terms.equity_percent}%{terms.has_voting_rights ? ' · Voting' : ''}
                  </p>
                </div>
              )}
            </div>

            {terms.notes && (
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '0 0 4px' }}>Notes</p>
                <p style={{ fontSize: 13, color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>{terms.notes}</p>
              </div>
            )}
          </div>

          {/* Save as template */}
          <div style={{
            background: 'var(--bone)', border: '1px solid var(--line)',
            borderRadius: 14, padding: '14px 16px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, margin: 0 }}>Save as template</p>
              <TogglePill value={saveTemplate} onChange={setSaveTemplate} />
            </div>
            {saveTemplate && (
              <div style={{ marginTop: 12 }}>
                <TextInput
                  value={templateName}
                  onChange={setTemplateName}
                  placeholder="Template name (optional)"
                />
              </div>
            )}
          </div>

          {saveError && (
            <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--clay)', margin: 0 }}>{saveError}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep('return')} style={{
              flex: 1, padding: 14, borderRadius: 999, border: '1.5px solid var(--line)',
              background: 'var(--bone)', color: 'var(--ink)',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
              Edit
            </button>
            <button onClick={handleSendOffer} disabled={saving} style={{
              flex: 2, padding: 14, borderRadius: 999, border: 'none',
              background: saving ? 'var(--linen)' : 'var(--ink)',
              color: saving ? 'var(--ink-4)' : 'var(--cream)',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 180ms',
            }}>
              {saving ? 'Sending…' : 'Send offer'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── STEP: sent ───────────────────────────────────────────────────────────────
  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Offer sent" sticky />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 999,
          background: 'var(--ink)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Icon name="check" size={30} color="var(--cream)" />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>Offer sent!</p>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.5, marginBottom: 36 }}>
          {counterparty || 'The business'} will be notified. You&apos;ll hear back when they respond.
        </p>
        <button onClick={() => router.back()} style={{
          padding: '12px 32px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: 'var(--ink)', color: 'var(--cream)',
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
        }}>
          Back to chat
        </button>
      </div>
    </div>
  )
}
