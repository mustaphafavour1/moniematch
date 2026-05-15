'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
  const router = useRouter()
  const [tab,      setTab]      = useState<'in'|'up'>('in')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState('')

  // After any successful auth, look up role and route
  const routeByRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/signin'); return }
    const { data } = await supabase.from('users').select('role, name').eq('id', user.id).maybeSingle()
    if (!data?.role) {
      // role not set yet — new user, needs onboarding
      router.replace('/investor/onboarding')
      return
    }
    if (data.role === 'investor')      router.replace('/investor')
    else if (data.role === 'business_owner') router.replace('/business')
    else router.replace('/investor')
  }

  const handleEmail = async () => {
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and password (min 6 chars).'); return
    }
    setBusy(true); setError('')
    try {
      if (tab === 'in') {
        const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
        if (e) throw e
      } else {
        const { error: e } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password })
        if (e) throw e
      }
      await routeByRole()
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : '').toLowerCase()
      if (msg.includes('invalid') || msg.includes('credentials')) setError('Wrong email or password.')
      else if (msg.includes('already')) setError('Email already registered — sign in instead.')
      else setError('Something went wrong. Try again.')
    }
    setBusy(false)
  }

  const handleGoogle = async () => {
    // Google redirects back here, then routeByRole handles it
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/signin`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (e) setError(e.message)
  }

  const inp: React.CSSProperties = {
    width: '100%', border: 0, background: 'transparent', outline: 'none',
    fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)',
  }
  const wrap: React.CSSProperties = {
    background: 'var(--bone)', border: '1px solid var(--line-strong)',
    borderRadius: 14, padding: '13px 16px',
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--cream)',
      fontFamily: 'var(--font-body)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 22px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MonieMatch" style={{ height: 48, objectFit: 'contain', marginBottom: 10 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)' }}>MonieMatch</div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(28,24,19,.07)', borderRadius: 100, padding: 4, marginBottom: 28 }}>
          {(['in', 'up'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '10px 0', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              background: tab === t ? 'var(--ink)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--ink-3)',
              transition: 'all .25s',
            }}>
              {t === 'in' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={wrap}>
            <input type="email" inputMode="email" autoComplete="email" value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="Email address" style={inp} />
          </div>
          <div style={{ ...wrap, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type={showPw ? 'text' : 'password'} autoComplete={tab==='in'?'current-password':'new-password'}
              value={password} onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Password" style={{ ...inp }} />
            <span onClick={() => setShowPw(s => !s)}
              style={{ fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer', userSelect: 'none', fontWeight: 500, flexShrink: 0 }}>
              {showPw ? 'Hide' : 'Show'}
            </span>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: 'var(--clay)', margin: 0, fontWeight: 500 }}>{error}</p>
          )}

          <button onClick={handleEmail} disabled={busy} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'var(--ink)', color: '#fff',
            fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
            opacity: busy ? 0.55 : 1, transition: 'opacity .2s',
          }}>
            {busy ? 'Please wait…' : tab === 'in' ? 'Sign in' : 'Create account'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line-strong)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line-strong)' }} />
          </div>

          <button onClick={handleGoogle} style={{
            width: '100%', padding: '13px 16px', borderRadius: 14,
            border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
            cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--ink-3)' }}>
          New investor?{' '}
          <a href="/join/investor" style={{ color: 'var(--clay)', fontWeight: 600, textDecoration: 'none' }}>Join as Investor</a>
          {' · '}
          <a href="/join/business" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>Join as Business</a>
        </div>
      </div>
    </div>
  )
}