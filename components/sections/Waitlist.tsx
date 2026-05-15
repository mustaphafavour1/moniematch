'use client'
import { useState } from 'react'
import { GOOGLE_FORMS } from '@/lib/constants'

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export default function Waitlist() {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone]   = useState(false)

  const submit = async () => {
    if (!email || !email.includes('@')) { alert('Enter a valid email address.'); return }
    const fd = new FormData()
    fd.append(GOOGLE_FORMS.waitlist.fields.name,  name)
    fd.append(GOOGLE_FORMS.waitlist.fields.email, email)
    try {
      await fetch(GOOGLE_FORMS.waitlist.url, { method: 'POST', body: fd, mode: 'no-cors' })
    } catch (_) {}
    setDone(true)
  }

  return (
    <section id="waitlist" style={{ padding: '68px 0', background: 'var(--ink)', borderTop: '1px solid rgba(148,134,97,.1)' }}>
      <div className="section-w">
        <div className="wl-row">
          <div className="wl-text rl">
            <h3>Be the first to know<br />when the app drops.</h3>
            <p>One email. No spam. Just the download link.</p>
          </div>

          <div className="rr" id="wlArea">
            {done ? (
              <div>
                <div style={{ padding: '14px 22px', background: 'rgba(148,134,97,.12)', border: '1px solid rgba(148,134,97,.25)', borderRadius: 100, fontSize: 13.5, color: 'var(--gold-l)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckIcon />
                  You&apos;re on the list! We&apos;ll drop the link in your inbox.
                </div>
                <p style={{ fontSize: 11, color: 'rgba(247,241,232,.2)', marginTop: 10 }}>
                  The web app is{' '}
                  <a href="/app" style={{ color: 'var(--gold)', textDecoration: 'none', borderBottom: '1px solid rgba(148,134,97,.25)' }}>
                    live right now →
                  </a>
                </p>
              </div>
            ) : (
              <div className="wl-fields">
                <div className="wl-row2">
                  <input className="wi" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                  <input className="wi" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="wl-row2">
                  <button className="bwl" onClick={submit}><BellIcon /> Notify Me</button>
                </div>
                <p className="wl-note" style={{ marginTop: 10 }}>
                  No spam. Unsubscribe anytime. The web app is{' '}
                  <a href="/app" style={{ color: 'var(--gold)', textDecoration: 'none', borderBottom: '1px solid rgba(148,134,97,.25)' }}>
                    live right now →
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
