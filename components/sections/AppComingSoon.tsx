import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'

export default function AppComingSoon() {
  return (
    <section id="app" style={{ padding: '96px 0', background: 'var(--snow)', textAlign: 'center' }}>
      <div className="section-w">
        <div className="rv" style={{ maxWidth: 600, margin: '0 auto' }}>
          <SectionLabel>Mobile App</SectionLabel>
          <h2 className="sh2" style={{ marginTop: 16 }}>
            MonieMatch is coming<br />to your <em className="em">pocket.</em>
          </h2>
          <p className="sb" style={{ marginTop: 16 }}>
            The full experience on iOS and Android. Match, deal, and track returns from anywhere.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 40, flexWrap: 'wrap' }}>
            {/* App Store */}
            <Link href="#waitlist" className="app-b">
              <span className="sn">Coming Soon</span>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20.94c1.5 0 3-.83 4-2l3-5c.83-1.5.83-3.5 0-5L16 4c-1-1.17-2.5-2-4-2-1.5 0-3 .83-4 2L5 8.94c-.83 1.5-.83 3.5 0 5l3 5c1 1.17 2.5 2 4 2z" />
                <path d="M12 6v6M12 18h.01" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <small style={{ display: 'block', fontSize: 9.5, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Download on the</small>
                <strong style={{ fontSize: 15 }}>App Store</strong>
              </div>
            </Link>

            {/* Google Play */}
            <Link href="#waitlist" className="app-b">
              <span className="sn">Coming Soon</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <small style={{ display: 'block', fontSize: 9.5, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Get it on</small>
                <strong style={{ fontSize: 15 }}>Google Play</strong>
              </div>
            </Link>
          </div>

          <p style={{ fontSize: 12, color: 'var(--dim)', marginTop: 18 }}>
            Meanwhile —{' '}
            <Link href="/app" style={{ color: 'var(--gold)', textDecoration: 'none', borderBottom: '1px solid rgba(148,134,97,.28)' }}>
              the web app is live right now →
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
