'use client'
import { useRouter } from 'next/navigation'

export default function SigninPickerPage() {
  const router = useRouter()

  return (
    <div style={{
      width: '100%', height: '100%', background: 'var(--cream)',
      fontFamily: 'var(--font-body)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '32px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Soft warm gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, #EFE3D0 0%, var(--cream) 55%)',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="MonieMatch" style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 14 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', marginBottom: 6 }}>
            Welcome back
          </div>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
            How are you joining MonieMatch?
          </p>
        </div>

        {/* Role buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button
            onClick={() => router.push('/investor/onboarding?mode=signin')}
            style={{
              width: '100%', padding: '18px 20px', borderRadius: 18, border: 'none',
              background: 'var(--clay)', color: '#fff', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
              textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 16, marginBottom: 3 }}>Investor</div>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>Back a business, track returns</div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </button>

          <button
            onClick={() => router.push('/business/onboarding?mode=signin')}
            style={{
              width: '100%', padding: '18px 20px', borderRadius: 18, border: 'none',
              background: 'var(--forest)', color: '#fff', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
              textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 16, marginBottom: 3 }}>Business Owner</div>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>Raise capital, grow your shop</div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--ink-3)' }}>
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
