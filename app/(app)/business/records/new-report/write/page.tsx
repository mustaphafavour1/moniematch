'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

const TEMPLATES = [
  { id: 'monthly',  label: 'Monthly update',    icon: 'doc' },
  { id: 'weekly',   label: 'Weekly snapshot',   icon: 'doc' },
  { id: 'sales',    label: 'Sales report',      icon: 'money' },
  { id: 'assets',   label: 'Asset update',      icon: 'clipboard' },
  { id: 'health',   label: 'Business health',   icon: 'star' },
]

interface Match { id: string; name: string }

export default function WriteReportPage() {
  const router = useRouter()
  const params = useSearchParams()
  const preselectedMatch = params.get('matchId') || ''

  const [step,          setStep]          = useState<'template' | 'form' | 'preview' | 'sent'>('template')
  const [template,      setTemplate]      = useState('')
  const [matches,       setMatches]       = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>(preselectedMatch)
  const [period,        setPeriod]        = useState('')
  const [revenue,       setRevenue]       = useState('')
  const [highlights,    setHighlights]    = useState('')
  const [challenges,    setChallenges]    = useState('')
  const [nextSteps,     setNextSteps]     = useState('')
  const [extraNote,     setExtraNote]     = useState('')
  const [bizName,       setBizName]       = useState('')
  const [sending,       setSending]       = useState(false)
  const [error,         setError]         = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('businesses').select('id, name').eq('owner_id', user.id).single().then(({ data: biz }) => {
        if (!biz) return
        setBizName(biz.name)
        supabase.from('matches').select('id, investors(full_name)').eq('business_id', biz.id).then(({ data: ms }) => {
          const list = (ms || []).map(m => ({
            id: m.id,
            name: (m.investors as { full_name?: string } | null)?.full_name || 'Investor',
          }))
          setMatches(list)
        })
      })
    })
  }, [])

  const templateLabel = TEMPLATES.find(t => t.id === template)?.label || ''

  const previewText = `
**${templateLabel} — ${bizName}**
Period: ${period}

Revenue / Sales: ${revenue || '—'}

Highlights:
${highlights || '—'}

Challenges:
${challenges || '—'}

Next steps:
${nextSteps || '—'}
${extraNote ? `\nAdditional notes:\n${extraNote}` : ''}
  `.trim()

  const handleSend = async () => {
    if (!selectedMatch || sending) return
    setSending(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()
      if (!biz) throw new Error('Business not found')

      const id = crypto.randomUUID()
      const { error: rErr } = await supabase.from('business_reports').insert({
        id,
        business_id: biz.id,
        match_id: selectedMatch,
        template,
        title: `${templateLabel} — ${period}`,
        content: previewText,
        status: 'sent',
      })
      if (rErr) throw rErr

      // Send as a chat message too
      await supabase.from('messages').insert({
        id: crypto.randomUUID(),
        match_id: selectedMatch,
        sender_id: user.id,
        content: `📋 ${templateLabel}${period ? ` — ${period}` : ''}`,
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

  const canContinueForm = period.trim() && selectedMatch

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title={step === 'template' ? 'Choose template' : step === 'preview' ? 'Preview' : 'Write a report'}
        leading={
          <RoundBtn onClick={() => {
            if (step === 'form') setStep('template')
            else if (step === 'preview') setStep('form')
            else router.back()
          }}>
            <Icon name="back" size={18} />
          </RoundBtn>
        }
        sticky
      />

      {step === 'template' && (
        <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, lineHeight: 1.55 }}>
            Pick a template to structure your report.
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
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{t.label}</span>
                <Icon name="fwd" size={14} color="var(--ink-4)" style={{ marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
            Fill in the details for your <strong>{templateLabel}</strong>.
          </p>

          {/* Investor select */}
          <Label>Send to</Label>
          <select value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12,
              border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
              fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)', marginBottom: 16 }}>
            <option value="">Select investor…</option>
            {matches.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <Label>Period covered (e.g. April 2025)</Label>
          <Input value={period} onChange={e => setPeriod(e.target.value)} placeholder="e.g. April 2025" />

          {(template === 'monthly' || template === 'weekly' || template === 'sales') && <>
            <Label>Revenue / Sales</Label>
            <Input value={revenue} onChange={e => setRevenue(e.target.value)} placeholder="₦0" />
          </>}

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

          <button onClick={() => setStep('preview')} disabled={!canContinueForm}
            className="btn btn-forest btn-block" style={{ marginTop: 8 }}>
            Preview report
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>
            This is how your report will look when sent.
          </p>
          <div style={{ background: 'var(--bone)', border: '1px solid var(--line)', borderRadius: 16,
            padding: '18px 16px', marginBottom: 20 }}>
            <pre style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink)',
              lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
              {previewText}
            </pre>
          </div>
          {error && <p style={{ fontSize: 13, color: 'var(--clay)', marginBottom: 12 }}>{error}</p>}
          <button onClick={handleSend} disabled={sending} className="btn btn-forest btn-block">
            {sending ? 'Sending…' : 'Send report'}
          </button>
          <button onClick={() => setStep('form')}
            style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, color: 'var(--ink-2)', fontFamily: 'var(--font-body)', width: '100%' }}>
            Edit
          </button>
        </div>
      )}

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

function Input({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 16,
        border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
        fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
        outline: 'none', boxSizing: 'border-box' }} />
  )
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
      style={{ width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 16,
        border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
        fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
        outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
  )
}
