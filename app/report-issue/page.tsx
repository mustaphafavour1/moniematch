'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

const REPORT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe7mIv-4OL28jgYM6Cfi1oZKoAc4NEeVdsysupSuI6y8gSvzQ/formResponse'
const REPORT_FIELDS = {
  name:        'entry.1116456308',
  email:       'entry.1153694053',
  category:    'entry.732858385',
  description: 'entry.1017287598',
}

const CATEGORIES = [
  'App bug',
  'Payment issue',
  'Account problem',
  'Safety concern',
  'Business conduct',
  'Investor conduct',
  'Other',
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 12,
  border: '1.5px solid rgba(28,24,19,.15)',
  background: '#fff',
  fontSize: 15,
  color: 'var(--ink)',
  outline: 'none',
  fontFamily: 'var(--f)',
  boxSizing: 'border-box',
  transition: 'border-color .2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: 'var(--ink)',
  marginBottom: 8,
}

export default function ReportIssuePage() {
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setSending(true)

    const fd = new FormData()
    fd.append(REPORT_FIELDS.name,        data.get('name')        as string)
    fd.append(REPORT_FIELDS.email,       data.get('email')       as string)
    fd.append(REPORT_FIELDS.category,    data.get('category')    as string)
    fd.append(REPORT_FIELDS.description, data.get('description') as string)

    try {
      await fetch(REPORT_FORM_URL, { method: 'POST', body: fd, mode: 'no-cors' })
    } catch (_) {}

    setSending(false)
    setSent(true)
    form.reset()
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />

      <main style={{ flex: 1, padding: '120px var(--pad) 96px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Heading */}
          <span style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'var(--gold)',
            display: 'inline-block',
            marginBottom: 16,
          }}>
            Support
          </span>
          <h1 style={{
            fontSize: 'clamp(28px,4vw,42px)',
            fontWeight: 800,
            color: 'var(--ink)',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            marginBottom: 12,
          }}>
            Report an Issue
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--dim)',
            lineHeight: 1.75,
            marginBottom: 40,
          }}>
            Help us make MonieMatch better. We take all reports seriously and will follow up where needed.
          </p>

          {/* Card */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: '40px 36px',
            boxShadow: '0 2px 24px rgba(28,24,19,.07)',
          }}>
            {sent ? (
              /* ── Success state ── */
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckIcon />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>
                  Report received
                </h2>
                <p style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.7, maxWidth: 340, margin: '0 auto 28px' }}>
                  Thank you for letting us know. Our team will review your report and follow up if needed.
                </p>
                <button
                  onClick={() => setSent(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 100,
                    border: '1.5px solid rgba(28,24,19,.15)',
                    background: 'transparent',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    fontFamily: 'var(--f)',
                  }}
                >
                  Submit another report
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div>
                  <label htmlFor="ri-name" style={labelStyle}>Name</label>
                  <input
                    id="ri-name"
                    name="name"
                    type="text"
                    placeholder="What do we call you?"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="ri-email" style={labelStyle}>Email</label>
                  <input
                    id="ri-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="ri-category" style={labelStyle}>Issue category</label>
                  <select
                    id="ri-category"
                    name="category"
                    required
                    defaultValue=""
                    style={{
                      ...inputStyle,
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231c1813' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: 40,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled>Select a category…</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ri-desc" style={labelStyle}>Description <span style={{ color: 'var(--gold)', fontWeight: 400 }}>*</span></label>
                  <textarea
                    id="ri-desc"
                    name="description"
                    placeholder="Describe what happened in as much detail as you can…"
                    required
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: 120,
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '15px 24px',
                    borderRadius: 100,
                    border: 'none',
                    background: 'var(--ink)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: sending ? 'wait' : 'pointer',
                    fontFamily: 'var(--f)',
                    opacity: sending ? 0.7 : 1,
                    transition: 'opacity .2s',
                  }}
                >
                  <SendIcon />
                  {sending ? 'Sending…' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>

          {/* Bottom note */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--dim)' }}>
            For urgent safety concerns, email us directly at{' '}
            <a href="mailto:admin@moniematch.com" style={{ color: 'var(--ink)', fontWeight: 600, textDecoration: 'none' }}>
              admin@moniematch.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
