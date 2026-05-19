'use client'
import '../(app)/app.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Step = 'phone' | 'details' | 'done'

export default function ActivatePage() {
  const router = useRouter()
  const [step,     setStep]     = useState<Step>('phone')
  const [phone,    setPhone]    = useState('')
  const [userName, setUserName] = useState('')
  const [role,     setRole]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  function normalisePhone(raw: string): string {
    const stripped = raw.replace(/\s/g, '')
    // Remove leading 0 — Supabase stores phone without it
    return stripped.startsWith('0') ? stripped.slice(1) : stripped
  }

  async function handlePhone() {
    if (!phone.trim()) { setError('Please enter your phone number.'); return }
    setLoading(true); setError('')
    const normalised = normalisePhone(phone)
    // Use RPC with SECURITY DEFINER to bypass RLS on unauthenticated lookup
    const { data, error: rpcErr } = await supabase
      .rpc('find_user_by_phone', { p_phone: normalised })
    setLoading(false)
    if (rpcErr) {
      setError(`Lookup error: ${rpcErr.message}. Please contact support.`)
      return
    }
    const found = Array.isArray(data) ? data[0] : data
    if (!found) {
      setError('We could not find an account with that phone number. Please check and try again (no leading zero needed), or contact support.')
      return
    }
    if (found.auth_uid) {
      setError('This account has already been activated. Please sign in instead.')
      return
    }
    setUserName(found.name || '')
    setRole(found.role || '')
    setStep('details')
  }

  async function handleActivate() {
    if (!email.trim())        { setError('Please enter your email.'); return }
    if (!password)            { setError('Please choose a password.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)  { setError('Passwords do not match.'); return }
    setLoading(true); setError('')

    const normalised = normalisePhone(phone)

    // Create the Supabase auth account
    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    if (signUpErr) {
      setLoading(false)
      setError(signUpErr.message || 'Could not create account. Please try again.')
      return
    }

    const userId = authData.user?.id
    if (!userId) { setLoading(false); setError('Unexpected error. Please try again.'); return }

    // Use RPC to link the new auth UID to the existing users row (avoids PK conflicts)
    const { data: rpcResult, error: rpcErr } = await supabase
      .rpc('activate_user', {
        p_phone:        normalised,
        p_new_auth_uid: userId,
        p_email:        email.trim(),
      })
    setLoading(false)

    if (rpcErr || rpcResult === 'not_found') {
      setError('Account created but could not link your profile. Contact support with your phone number.')
      return
    }

    setRole(rpcResult as string)
    setStep('done')
  }

  function handleDone() {
    router.push('/signin')
  }

  const s: React.CSSProperties = {
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

        {step === 'phone' && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
              Activate your account
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              Your account has been pre-created. Enter the phone number associated with your profile to get started.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                Phone number
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handlePhone() }}
                placeholder="e.g. 08012345678" style={s} />
            </div>

            {error ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginBottom: 16 }}>
                {error}
              </div>
            ) : null}

            <button onClick={handlePhone} disabled={loading}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--ink)', color: 'var(--cream)', fontSize: 16, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'var(--font-body)' }}>
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
            {userName ? (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--forest-tint)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Welcome, {userName.split(' ')[0]}!</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Account found · {role === 'business_owner' ? 'Business owner' : 'Investor'}</div>
                </div>
              </div>
            ) : null}

            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 6, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
              Set your login details
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.6 }}>
              Choose an email and password to access your MonieMatch account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                  Email address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" style={s} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                  Password
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters" style={s} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>
                  Confirm password
                </label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleActivate() }}
                  placeholder="Re-enter password" style={s} />
              </div>
            </div>

            {error ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginBottom: 16 }}>
                {error}
              </div>
            ) : null}

            <button onClick={handleActivate} disabled={loading}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--forest)', color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1 }}>
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
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--forest-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
              ✓
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 12, letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>
              Account activated!
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 32, lineHeight: 1.6 }}>
              Your account is now active. Sign in with your email and password to continue.
            </p>
            <button onClick={handleDone}
              style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'var(--ink)', color: 'var(--cream)', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Sign in →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
