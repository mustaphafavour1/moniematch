'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { GOOGLE_FORMS } from '@/lib/constants'

export default function ContactPage() {
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setSending(true)

    const fd = new FormData()
    fd.append(GOOGLE_FORMS.contact.fields.name,    data.get('name')    as string)
    fd.append(GOOGLE_FORMS.contact.fields.email,   data.get('email')   as string)
    fd.append(GOOGLE_FORMS.contact.fields.role,    data.get('role')    as string)
    fd.append(GOOGLE_FORMS.contact.fields.message, data.get('message') as string)

    try {
      await fetch(GOOGLE_FORMS.contact.url, { method: 'POST', body: fd, mode: 'no-cors' })
    } catch (_) {}

    setSending(false)
    setSent(true)
    form.reset()
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />

      {/* Hero */}
      <div style={{ paddingTop: 80, background: 'var(--cream)', padding: '120px var(--pad) 64px', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase', color: 'var(--gold)',
          padding: '5px 14px', border: '1px solid rgba(148,134,97,.28)', borderRadius: 100, marginBottom: 20,
        }}>
          Get in touch
        </span>
        <h1 style={{
          fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, letterSpacing: '-2px',
          color: 'var(--ink)', lineHeight: 1.05, marginBottom: 18,
        }}>
          Let&apos;s talk <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>business.</em>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--dim)', lineHeight: 1.75, maxWidth: 540, margin: '0 auto' }}>
          Questions, partnerships, press — we&apos;re a small team and we actually read our emails.
        </p>
      </div>

      {/* Contact section */}
      <section style={{ background: 'var(--ink-2)', padding: '80px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--pad)', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 72, alignItems: 'start' }}>

          {/* Left — contact info */}
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(247,241,232,.38)', marginBottom: 12 }}>
              Reach us directly
            </p>
            <p style={{ fontSize: 13, color: 'rgba(247,241,232,.45)', marginBottom: 32, lineHeight: 1.7 }}>
              We&apos;re usually online weekdays. Expect a reply within 24 hours.
            </p>

            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,241,232,.3)', marginBottom: 8 }}>Email</p>
            <a href="mailto:admin@moniematch.com" style={{
              display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(247,241,232,.88)',
              textDecoration: 'none', fontSize: 14, fontWeight: 500, marginBottom: 32,
            }}>
              <MailIcon /> admin@moniematch.com
            </a>

            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,241,232,.3)', marginBottom: 12 }}>Follow us</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { title: 'Instagram', icon: <InstagramIcon /> },
                { title: 'Twitter/X',  icon: <TwitterIcon /> },
                { title: 'LinkedIn',  icon: <LinkedInIcon /> },
                { title: 'TikTok',    icon: <TikTokIcon /> },
              ].map(s => (
                <a key={s.title} href="#" title={s.title} style={{
                  width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.09)',
                  color: 'rgba(247,241,232,.6)', transition: 'all .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,160,74,.12)'; e.currentTarget.style.borderColor = 'rgba(229,160,74,.3)'; e.currentTarget.style.color = 'var(--amber)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.09)'; e.currentTarget.style.color = 'rgba(247,241,232,.6)' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{
            background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 24, padding: '40px 36px',
          }}>
            {sent ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '20px 24px', background: 'rgba(148,134,97,.1)',
                border: '1px solid rgba(148,134,97,.25)', borderRadius: 14,
                color: 'rgba(247,241,232,.88)', fontSize: 15, fontWeight: 500,
              }}>
                <CheckCircleIcon /> Message received! We&apos;ll get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'rgba(247,241,232,.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }} htmlFor="cp-name">
                    Your Name
                  </label>
                  <input
                    id="cp-name" name="name" type="text" placeholder="What do we call you?" required
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                      color: 'rgba(247,241,232,.9)', fontSize: 14, outline: 'none',
                      fontFamily: 'var(--f)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'rgba(247,241,232,.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }} htmlFor="cp-email">
                    Email Address
                  </label>
                  <input
                    id="cp-email" name="email" type="email" placeholder="your@email.com" required
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                      color: 'rgba(247,241,232,.9)', fontSize: 14, outline: 'none',
                      fontFamily: 'var(--f)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'rgba(247,241,232,.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }} htmlFor="cp-role">
                    I am a...
                  </label>
                  <input
                    id="cp-role" name="role" type="text" placeholder="e.g. Investor, Business owner, Partner..."
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                      color: 'rgba(247,241,232,.9)', fontSize: 14, outline: 'none',
                      fontFamily: 'var(--f)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'rgba(247,241,232,.45)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }} htmlFor="cp-msg">
                    Message
                  </label>
                  <textarea
                    id="cp-msg" name="message" rows={5} placeholder="Tell us what's on your mind..."
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                      color: 'rgba(247,241,232,.9)', fontSize: 14, outline: 'none', resize: 'vertical',
                      fontFamily: 'var(--f)',
                    }}
                  />
                </div>
                <button
                  type="submit" disabled={sending}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '14px 28px', borderRadius: 100,
                    background: sending ? 'rgba(148,134,97,.4)' : 'var(--amber)',
                    color: sending ? 'rgba(247,241,232,.5)' : 'var(--ink)',
                    border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, transition: 'all .25s',
                  }}
                >
                  <SendIcon /> {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        input::placeholder, textarea::placeholder { color: rgba(247,241,232,.25); }
        input:focus, textarea:focus { border-color: rgba(229,160,74,.4) !important; }
      `}</style>
    </div>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
    </svg>
  )
}
function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}
