'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'phone' | 'details' | 'done'

export default function ActivatePage() {
  const router = useRouter()
  const [step,     setStep]     = useState<Step>('phone')
  const [phone,    setPhone]    = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // Step 1 — verify phone exists in users table
  async function handlePhone() {
    if (!phone.trim()) { setError('Please enter your phone number.'); return }
    setLoading(true); setError('')
    const normalised = phone.replace(/\s/g, '')
    const { data, error: dbErr } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('phone', normalised)
      .maybeSingle()
    setLoading(false)
    if (dbErr || !data) {
      setError('We could not find an account with that phone number. Please check and try again, or contact support.')
      return
    }
    setStep('details')
  }

  // Step 2 — create Supabase auth account and link to existing user row
  async function handleActivate() {
    if (!email.trim())    { setError('Please enter your email.'); return }
    if (!password)        { setError('Please choose a password.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')

    const normalised = phone.replace(/\s/g, '')

    // Sign up with email + password
    const { data: authData, error: signUpErr } = await supabase.auth.signUp({ email: email.trim(), password })
    if (signUpErr) {
      setLoading(false)
      setError(signUpErr.message || 'Could not create account. Please try again.')
      return
    }

    const userId = authData.user?.id
    if (!userId) { setLoading(false); setError('Unexpected error. Please try again.'); return }

    // Link the new auth user to the existing users row by phone
    const { error: updateErr } = await supabase
      .from('users')
      .update({ id: userId, email: email.trim(), must_change_password: false })
      .eq('phone', normalised)
    setLoading(false)

    if (updateErr) {
      setError('Account created but could not link your profile. Contact support with your phone number.')
      return
    }

    setStep('done')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    border: '1.5px solid var(--line-strong)', background: 'var(--cream)',
    fontSize: 16, color: 'var(--ink)', outline: 'none',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1 }}>
            MonieMatch
          </div>
        </div>

        {step === 'phone' && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: -0.5 }}>
              Activate your account
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              Your account has been pre-created. Enter the phone number associated with your profile to get started.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handlePhone() }}
                placeholder="e.g. 08012345678"
                style={inputStyle}
              />
            </div>

            {error ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginBottom: 16 }}>
                {error}
              </div>
            ) : null}

            <button
              onClick={handlePhone}
              disabled={loading}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--ink)', color: 'var(--cream)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              {loading ? 'Checking…' : 'Continue →'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--ink-3)' }}>
              Already have an account?{' '}
              <span onClick={() => router.push('/signin')} style={{ color: 'var(--forest)', cursor: 'pointer', fontWeight: 600 }}>
                Sign in
              </span>
            </p>
          </div>
        )}

        {step === 'details' && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: -0.5 }}>
              Set your login details
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              Choose an email and password to access your MonieMatch account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                  Email address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                  Password
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                  Confirm password
                </label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleActivate() }}
                  placeholder="Re-enter password" style={inputStyle} />
              </div>
            </div>

            {error ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginBottom: 16 }}>
                {error}
              </div>
            ) : null}

            <button
              onClick={handleActivate}
              disabled={loading}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--forest)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              {loading ? 'Activating…' : 'Activate account →'}
            </button>

            <button onClick={() => { setStep('phone'); setError('') }}
              style={{ width: '100%', padding: '12px', marginTop: 10, borderRadius: 14, border: 'none', background: 'transparent', fontSize: 14, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ← Back
            </button>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
              ✓
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, letterSpacing: -0.5 }}>
              Account activated!
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              You can now sign in with your email and password.
            </p>
            <button
              onClick={() => router.push('/signin')}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--ink)', color: 'var(--cream)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Sign in →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
