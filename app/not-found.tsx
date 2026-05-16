import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream)', fontFamily: 'var(--font-body)',
      padding: '32px 24px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 96, color: 'var(--line-strong)', lineHeight: 1 }}>
        404
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', marginTop: 16 }}>
        This page doesn&apos;t exist
      </div>
      <p style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 10, maxWidth: 320, lineHeight: 1.55 }}>
        The link might be broken, or the page may have been moved.
      </p>
      <Link href="/" style={{
        display: 'inline-block', marginTop: 28,
        background: 'var(--ink)', color: 'var(--cream)',
        padding: '13px 28px', borderRadius: 14,
        fontWeight: 700, fontSize: 15, textDecoration: 'none',
      }}>
        Back to home
      </Link>
    </div>
  )
}
