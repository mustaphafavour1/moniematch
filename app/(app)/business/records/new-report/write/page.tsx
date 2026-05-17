'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

const TEMPLATES = [
  { id: 'blank',   label: 'Start from scratch', sub: 'Free-form title and content — write exactly what you want', icon: 'doc' },
  { id: 'monthly', label: 'Monthly update',     sub: 'Revenue, highlights, challenges, and next steps', icon: 'calendar' },
  { id: 'weekly',  label: 'Weekly snapshot',    sub: 'Quick progress check — what happened this week', icon: 'chart' },
  { id: 'sales',   label: 'Sales report',       sub: 'Revenue figures, top products/services, conversion', icon: 'money' },
  { id: 'assets',  label: 'Asset update',       sub: 'Equipment, inventory, and capital allocation', icon: 'clipboard' },
  { id: 'health',  label: 'Business health',    sub: 'Holistic overview — team, cash flow, risk, outlook', icon: 'star' },
]

interface Match { id: string; name: string }

// format number with commas while preserving cursor position
function toComma(val: string) {
  const digits = val.replace(/[^0-9]/g, '')
  return digits ? Number(digits).toLocaleString() : ''
}
function fromComma(val: string) {
  return Number(val.replace(/,/g, '')) || 0
}

export default function WriteReportPage() {
  const router = useRouter()
  const params = useSearchParams()
  const preselectedMatch = params.get('matchId') || ''

  const [step,          setStep]          = useState<'template' | 'form' | 'preview' | 'send' | 'sent'>('template')
  const [template,      setTemplate]      = useState('')
  const [matches,       setMatches]       = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>(preselectedMatch)
  const [bizName,       setBizName]       = useState('')
  const [bizId,         setBizId]         = useState('')
  const [uid,           setUid]           = useState('')

  // Blank template fields
  const [blankTitle,   setBlankTitle]   = useState('')
  const [blankContent, setBlankContent] = useState('')

  // Structured template fields
  const [period,     setPeriod]     = useState('')
  const [revenue,    setRevenue]    = useState('')   // stored as formatted string
  const [highlights, setHighlights] = useState('')
  const [challenges, setChallenges] = useState('')
  const [nextSteps,  setNextSteps]  = useState('')
  const [extraNote,  setExtraNote]  = useState('')

  const [sending,       setSending]       = useState(false)
  const [savingDraft,   setSavingDraft]   = useState(false)
  const [error,         setError]         = useState('')
  const [investorSearch, setInvestorSearch] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUid(user.id)
      supabase.from('businesses').select('id, name').eq('owner_id', user.id).single().then(({ data: biz }) => {
        if (!biz) return
        setBizName(biz.name)
        setBizId(biz.id)
        // Use the correct join path: matches → investors → users
        supabase
          .from('matches')
          .select('id, investors(users(name))')
          .eq('business_id', biz.id)
          .then(async ({ data: ms }) => {
            const all = (ms || []).map((m: Record<string, unknown>) => {
              const inv = (m.investors as unknown) as Record<string, unknown> | null
              const usr = (inv?.users as unknown) as Record<string, unknown> | null
              return { id: m.id as string, name: (usr?.name as string) || 'Investor' }
            })
            const matchIds = all.map(m => m.id)
            if (matchIds.length > 0) {
              const { data: msgs } = await supabase.from('messages').select('match_id').in('match_id', matchIds)
              const activeIds = new Set((msgs || []).map((msg: { match_id: string }) => msg.match_id))
              setMatches(all.filter(m => activeIds.has(m.id)))
            } else {
              setMatches([])
            }
          })
      })
    })
  }, [])

  const templateMeta = TEMPLATES.find(t => t.id === template)
  const isBlank = template === 'blank'

  const today = new Date().toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })

  const previewText = isBlank
    ? blankContent
    : `${templateMeta?.label || ''} — ${bizName}
Period: ${period}

Revenue / Sales: ${revenue || '—'}

Highlights:
${highlights || '—'}

Challenges:
${challenges || '—'}

Next steps:
${nextSteps || '—'}
${extraNote ? `\nAdditional notes:\n${extraNote}` : ''}`.trim()

  const reportTitle = isBlank ? blankTitle : `${templateMeta?.label || ''} — ${period || today}`

  const canPreview = isBlank
    ? blankTitle.trim() && blankContent.trim()
    : period.trim()

  const handleSend = async () => {
    if (!selectedMatch || sending) return
    setSending(true)
    setError('')
    try {
      if (!uid || !bizId) throw new Error('Not signed in')

      const id = crypto.randomUUID()
      const { error: rErr } = await supabase.from('business_reports').insert({
        id,
        business_id: bizId,
        match_id: selectedMatch,
        template,
        title: reportTitle,
        content: previewText,
        status: 'sent',
      })
      if (rErr) throw rErr

      await supabase.from('messages').insert({
        id: crypto.randomUUID(),
        match_id: selectedMatch,
        sender_id: uid,
        content: `📋 ${reportTitle}`,
        content_type: 'report',
        ref_id: id,
      })

      setStep('sent')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  const handleSaveDraft = async () => {
    if (savingDraft) return
    setSavingDraft(true)
    setError('')
    try {
      if (!uid || !bizId) throw new Error('Not signed in')
      const { error: rErr } = await supabase.from('business_reports').insert({
        id: crypto.randomUUID(),
        business_id: bizId,
        match_id: selectedMatch || null,
        template,
        title: reportTitle,
        content: previewText,
        status: 'draft',
      })
      if (rErr) throw rErr
      router.push('/business/records')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSavingDraft(false)
    }
  }

  const backLabel = () => {
    if (step === 'form')    return () => setStep('template')
    if (step === 'preview') return () => setStep('form')
    if (step === 'send')    return () => setStep('preview')
    return () => router.back()
  }

  const headerTitle = {
    template: 'Choose template',
    form:     isBlank ? 'Write report' : templateMeta?.label || 'Report',
    preview:  'Preview',
    send:     'Send report',
    sent:     'Sent',
  }[step]

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title={headerTitle}
        leading={<RoundBtn onClick={backLabel()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      {/* ── TEMPLATE PICKER ── */}
      {step === 'template' && (
        <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, lineHeight: 1.55 }}>
            Pick a template or start with a blank page.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => { setTemplate(t.id); setStep('form') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--bone)', border: '1.5px solid var(--line)',
                  borderRadius: 14, padding: '16px 14px', cursor: 'pointer',
                  textAlign: 'left', width: '100%',
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--linen)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={t.icon} size={20} color="var(--forest)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t.sub}</div>
                </div>
                <Icon name="fwd" size={14} color="var(--ink-4)" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── FORM (blank) ── */}
      {step === 'form' && isBlank && (
        <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
          <Label>Report title</Label>
          <Input value={blankTitle} onChange={e => setBlankTitle(e.target.value)} placeholder="e.g. April 2025 update" />

          <Label>Date</Label>
          <Input value={today} onChange={() => {}} style={{ color: 'var(--ink-3)' }} />

          <Label>Content</Label>
          <textarea value={blankContent} onChange={e => setBlankContent(e.target.value)}
            placeholder="Write your full report here…" rows={12}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 16,
              border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
              fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
              outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />

          <button onClick={() => setStep('preview')} disabled={!canPreview}
            className="btn btn-forest btn-block">
            Preview report
          </button>
        </div>
      )}

      {/* ── FORM (template) ── */}
      {step === 'form' && !isBlank && (
        <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
            Fill in the details for your <strong>{templateMeta?.label}</strong>.
          </p>

          <Label>Period covered (e.g. April 2025)</Label>
          <Input value={period} onChange={e => setPeriod(e.target.value)} placeholder="e.g. April 2025" />

          {(template === 'monthly' || template === 'weekly' || template === 'sales') && (
            <>
              <Label>Revenue / Sales (₦)</Label>
              <Input
                value={revenue}
                onChange={e => setRevenue(toComma(e.target.value))}
                placeholder="e.g. 500,000"
              />
            </>
          )}

          <Label>Highlights</Label>
          <Textarea value={highlights} onChange={e => setHighlights(e.target.value)}
            placeholder="What went well this period?" />

          <Label>Challenges</Label>
          <Textarea value={challenges} onChange={e => setChallenges(e.target.value)}
            placeholder="Any blockers or setbacks?" />

          <Label>Next steps</Label>
          <Textarea value={nextSteps} onChange={e => setNextSteps(e.target.value)}
            placeholder="What are you focused on next?" />

          <Label>Additional notes (optional)</Label>
          <Textarea value={extraNote} onChange={e => setExtraNote(e.target.value)}
            placeholder="Anything else your investor should know…" />

          <button onClick={() => setStep('preview')} disabled={!canPreview}
            className="btn btn-forest btn-block" style={{ marginTop: 8 }}>
            Preview report
          </button>
        </div>
      )}

      {/* ── PREVIEW ── */}
      {step === 'preview' && (
        <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
            This is how your report will look when sent.
          </p>
          <div style={{ background: 'var(--bone)', border: '1px solid var(--line)', borderRadius: 16,
            padding: '18px 16px', marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--ink)', marginBottom: 12 }}>
              {reportTitle}
            </div>
            <pre style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink)',
              lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
              {previewText}
            </pre>
          </div>
          <button onClick={() => setStep('send')} className="btn btn-forest btn-block">
            Choose who to send to →
          </button>
          <button onClick={handleSaveDraft} disabled={savingDraft}
            style={{ marginTop: 10, width: '100%', padding: '13px', borderRadius: 12,
              background: 'var(--bone)', border: '1.5px solid var(--line-strong)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500, color: 'var(--ink-2)',
              fontFamily: 'var(--font-body)' }}>
            {savingDraft ? 'Saving…' : 'Save to drafts'}
          </button>
          {error && <p style={{ fontSize: 13, color: 'var(--clay)', marginTop: 8 }}>{error}</p>}
          <button onClick={() => setStep('form')}
            style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, color: 'var(--ink-3)', fontFamily: 'var(--font-body)', width: '100%' }}>
            Edit report
          </button>
        </div>
      )}

      {/* ── SEND (select investor) ── */}
      {step === 'send' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Search bar */}
          <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
              Choose which investor to send this report to.
            </p>
            {matches.length > 1 && (
              <div style={{ background: 'var(--bone)', border: '1px solid var(--line-strong)',
                borderRadius: 20, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {investorSearch && (
                  <button onClick={() => setInvestorSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <Icon name="close" size={14} color="var(--ink-3)" />
                  </button>
                )}
                <input
                  value={investorSearch}
                  onChange={e => setInvestorSearch(e.target.value)}
                  placeholder="Search investors…"
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none',
                    fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}
                />
                <Icon name="search" size={14} color="var(--forest)" />
              </div>
            )}
          </div>

          {/* Scrollable investor list */}
          <div className="scroll" style={{ flex: 1, padding: '0 16px 16px' }}>
            {matches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)', fontSize: 14 }}>
                No investor conversations yet. Start a chat from the Investors tab first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
                {matches
                  .filter(m => !investorSearch.trim() || m.name.toLowerCase().includes(investorSearch.toLowerCase()))
                  .map(m => (
                    <button key={m.id} onClick={() => setSelectedMatch(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: selectedMatch === m.id ? 'var(--linen)' : 'var(--bone)',
                        border: `1.5px solid ${selectedMatch === m.id ? 'var(--forest)' : 'var(--line)'}`,
                        borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%',
                      }}>
                      <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--linen)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        border: '1px solid var(--line-strong)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', flex: 1 }}>{m.name}</span>
                      {selectedMatch === m.id && <Icon name="check" size={16} color="var(--forest)" />}
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          {/* Sticky send button — above bottom nav (80px) */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', background: 'var(--cream)',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', flexShrink: 0 }}>
            {error && <p style={{ fontSize: 13, color: 'var(--clay)', marginBottom: 8 }}>{error}</p>}
            <button onClick={handleSend}
              disabled={!selectedMatch || sending}
              className="btn btn-forest btn-block">
              {sending ? 'Sending…' : 'Send report'}
            </button>
          </div>
        </div>
      )}

      {/* ── SENT ── */}
      {step === 'sent' && (
        <div className="scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>
            Report sent
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 32 }}>
            Your investor has been notified.
          </div>
          <button onClick={() => router.push('/business/records')} className="btn btn-forest">
            Back to Records
          </button>
        </div>
      )}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.04em',
      textTransform: 'uppercase', marginBottom: 6 }}>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, style }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  style?: React.CSSProperties
}) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 16,
        border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
        fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
        outline: 'none', boxSizing: 'border-box', ...style }} />
  )
}

function Textarea({ value, onChange, placeholder }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
}) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
      style={{ width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 16,
        border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
        fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
        outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
  )
}
