'use client'
import { useState } from 'react'
import SectionLabel from '@/components/ui/SectionLabel'
import { GOOGLE_FORMS } from '@/lib/constants'

export default function Contact() {
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
    <section id="contact" style={{ padding: '96px 0', background: 'var(--ink-2)' }}>
      <div className="section-w">
        <div className="ct-grid">
          {/* Left */}
          <div className="rl">
            <SectionLabel light>Contact Us</SectionLabel>
            <h2 className="sh2" style={{ color: '#fff', marginTop: 16 }}>
              Let&apos;s talk<br /><em className="em">business.</em>
            </h2>
            <p className="sb" style={{ color: 'rgba(247,241,232,.5)', marginTop: 24 }}>
              Questions, partnerships, press — we&apos;re a small team and we actually read our emails.
            </p>
            <p className="ct-lbl" style={{ marginTop: 32 }}>Email</p>
            <a href="mailto:hello@moniematch.com" className="ct-link">
              <MailIcon /> hello@moniematch.com
            </a>
            <p className="ct-lbl">Follow us</p>
            <div className="socials">
              <a href="#" className="soc" title="Instagram"><InstagramIcon /></a>
              <a href="#" className="soc" title="Twitter"><TwitterIcon /></a>
              <a href="#" className="soc" title="LinkedIn"><LinkedInIcon /></a>
              <a href="#" className="soc" title="TikTok"><TikTokIcon /></a>
            </div>
          </div>

          {/* Right */}
          <div className="rr">
            {sent ? (
              <div className="form-success show" style={{ display: 'flex' }}>
                <CheckCircleIcon /> Message received! We&apos;ll get back to you soon.
              </div>
            ) : (
              <form className="ctf" onSubmit={handleSubmit}>
                <div>
                  <label className="flbl" htmlFor="ct-name">Your Name</label>
                  <input className="fi" id="ct-name" name="name" type="text" placeholder="What do we call you?" required />
                </div>
                <div>
                  <label className="flbl" htmlFor="ct-email">Email Address</label>
                  <input className="fi" id="ct-email" name="email" type="email" placeholder="your@email.com" required />
                </div>
                <div>
                  {/* Short-answer text field — avoids exact-match constraint of Google Form multiple choice */}
                  <label className="flbl" htmlFor="ct-role">I am a...</label>
                  <input
                    className="fi" id="ct-role" name="role" type="text"
                    placeholder="e.g. Investor, Business owner, Partner..."
                  />
                </div>
                <div>
                  <label className="flbl" htmlFor="ct-msg">Message</label>
                  <textarea className="fta" id="ct-msg" name="message" placeholder="Tell us what's on your mind..." />
                </div>
                <button type="submit" className="bsend" disabled={sending}>
                  <SendIcon /> {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}
function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  )
}
function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
    </svg>
  )
}
function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}
