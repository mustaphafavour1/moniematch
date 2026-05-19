'use client'
import '../(app)/app.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'form' | 'sent'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step,    setStep]    = useState<Step>('form')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit() {
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/reset-password',
    })
    setLoading(false)
    if (err) {
      setError(err.message || 'Could not send reset link. Please try again.')
      return
    }
    setStep('sent')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
    fontSize: 16, color: 'var(--ink)', outline: 'none',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: -1 }}>
            MonieMatch
          </div>
        </div>

        {step === 'form' && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
              Reset your password
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              Enter the email address on your account and we&rsquo;ll send you a link to reset your password.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="your@email.com"
                autoCapitalize="none"
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--forest)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <button
              onClick={() => router.push('/signin')}
              style={{ width: '100%', padding: '12px', marginTop: 10, borderRadius: 14, border: 'none', background: 'transparent', fontSize: 14, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              ← Back to sign in
            </button>
          </div>
        )}

        {step === 'sent' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--forest-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
              ✉
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
              Check your email
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              We sent a reset link to <strong style={{ color: 'var(--ink)' }}>{email}</strong>. Click the link in that email to choose a new password.
            </p>
            <button
              onClick={() => router.push('/signin')}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--ink)', color: 'var(--cream)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Back to sign in
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
