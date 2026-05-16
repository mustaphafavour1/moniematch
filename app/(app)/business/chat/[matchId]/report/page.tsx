'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { submitIssueReport } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

const CATEGORIES = [
  { label: 'Fraud or scam',          value: 'fraud'       },
  { label: 'Harassment',             value: 'harassment'  },
  { label: 'Misleading information', value: 'misleading'  },
  { label: 'Spam',                    value: 'spam'        },
  { label: 'Other',                   value: 'other'       },
]

export default function BizReportPage() {
  const router  = useRouter()
  const params  = useParams()
  const matchId = params.matchId as string

  const [category,    setCategory]    = useState('')
  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [done,        setDone]        = useState(false)
  const [error,       setError]       = useState('')

  const canSubmit = category && description.trim().length >= 20

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError('')
    try {
      await submitIssueReport(matchId, category, description.trim())
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Report an issue"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '20px 16px 32px' }}>
        {done ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 999,
              background: 'var(--forest)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Icon name="check" size={28} color="var(--cream)" />
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', marginBottom: 8 }}>
              Report submitted
            </p>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.5 }}>
              Thank you for letting us know. We&apos;ll review your report and take appropriate action.
            </p>
            <button
              onClick={() => router.back()}
              style={{
                padding: '12px 28px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: 'var(--forest)', color: 'var(--cream)',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
              }}
            >
              Go back
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, lineHeight: 1.5 }}>
              Help us keep MonieMatch safe. Reports are confidential.
            </p>

            {/* Category */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                What&apos;s the issue?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    style={{
                      padding: '8px 14px', borderRadius: 999, border: '1.5px solid',
                      borderColor: category === cat.value ? 'var(--forest)' : 'var(--line)',
                      background: category === cat.value ? 'var(--forest)' : 'var(--bone)',
                      color: category === cat.value ? 'var(--cream)' : 'var(--ink)',
                      fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer',
                      transition: 'all 180ms',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                Describe what happened
              </p>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell us what happened in detail…"
                rows={5}
                style={{
                  width: '100%', borderRadius: 12, border: '1px solid var(--line-strong)',
                  background: 'var(--bone)', padding: '12px 14px', resize: 'none',
                  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
                  outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
                }}
              />
              <p style={{ fontSize: 11.5, color: description.trim().length < 20 && description.length > 0 ? 'var(--clay)' : 'var(--ink-4)', marginTop: 5 }}>
                {description.trim().length} / 20 characters minimum
              </p>
            </div>

            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #f5c6c6', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--clay)', margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 999, border: 'none',
                background: canSubmit ? 'var(--forest)' : 'var(--linen)',
                color: canSubmit ? 'var(--cream)' : 'var(--ink-4)',
                fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed',
                transition: 'all 180ms',
              }}
            >
              {loading ? 'Submitting…' : 'Submit report'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
