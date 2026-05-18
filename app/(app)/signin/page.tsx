'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function SigninPage() {
  const router = useRouter()
  const [emailOrUser, setEmailOrUser] = useState('')
  const [password,    setPassword]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSignIn = async () => {
    if (!emailOrUser.trim() || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    setError('')
    try {
      await signIn(emailOrUser, password)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sign in failed.')
      const { data: profile } = await supabase.from('users').select('role')
        .or(`id.eq.${user.id},auth_uid.eq.${user.id}`).maybeSingle()
      if (profile?.role === 'business_owner') { router.replace('/business'); return }
      router.replace('/investor')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.')
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: 0, background: 'transparent', outline: 'none',
    fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)',
  }
  const fieldWrap: React.CSSProperties = {
    background: 'var(--bone)', border: '1px solid var(--line-strong)',
    borderRadius: 14, padding: '12px 16px',
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: 'var(--cream)',
      fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '32px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #EFE3D0 0%, var(--cream) 55%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MonieMatch" style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 14 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', marginBottom: 6 }}>
            Welcome back
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
            Sign in to your MonieMatch account
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={fieldWrap}>
            <input value={emailOrUser} onChange={e => setEmailOrUser(e.target.value)}
              placeholder="Email or username" autoCapitalize="none" autoComplete="email"
              style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
          </div>
          <div style={fieldWrap}>
            <input value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" type="password" autoComplete="current-password"
              style={inputStyle} onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
          </div>

          {error && (
            <div style={{ background: 'var(--clay-tint)', border: '1px solid var(--clay)',
              borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--clay)' }}>
              {error}
            </div>
          )}

          <button onClick={handleSignIn} disabled={loading}
            style={{ width: '100%', padding: '15px 20px', borderRadius: 14, border: 'none',
              background: 'var(--ink)', color: 'var(--cream)', cursor: loading ? 'default' : 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
              opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--ink-3)' }}>
          New to MonieMatch?{' '}
          <a href="/investor/onboarding" style={{ color: 'var(--clay)', fontWeight: 600, textDecoration: 'none' }}>
            Join as Investor
          </a>
          {' · '}
          <a href="/business/onboarding" style={{ color: 'var(--forest)', fontWeight: 600, textDecoration: 'none' }}>
            Join as Business
          </a>
        </div>
      </div>
    </div>
  )
}
