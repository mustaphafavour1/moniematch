'use client'
import '../(app)/app.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'loading' | 'form' | 'success' | 'invalid'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step,        setStep]        = useState<Step>('loading')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('form')
      }
    })
    // If we already have a session (recovery token processed), show form immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStep('form')
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit() {
    if (!password)               { setError('Please enter a new password.'); return }
    if (password.length < 8)     { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)    { setError('Passwords do not match.'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) {
      setError(err.message || 'Could not update password. The reset link may have expired.')
      return
    }
    setStep('success')
    setTimeout(() => router.push('/signin'), 2000)
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

        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-3)', fontSize: 14 }}>
            Verifying reset link…
          </div>
        )}

        {step === 'invalid' && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
              Link expired
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              This reset link is no longer valid. Please request a new one.
            </p>
            <button
              onClick={() => router.push('/forgot-password')}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--ink)', color: 'var(--cream)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Request new link
            </button>
          </div>
        )}

        {step === 'form' && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
              Choose a new password
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              Enter a new password for your MonieMatch account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
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
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--forest-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
              ✓
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
              Password updated!
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6 }}>
              Your password has been changed. Redirecting you to sign in…
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
