import SectionLabel from '@/components/ui/SectionLabel'

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Smoother Negotiations',
    desc: 'Make offers, counter-offers, and close deals entirely in-app. Auto-calculated figures, no WhatsApp confusion.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2l6 6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    title: 'Smart Monthly Reporting',
    desc: 'Business owners submit monthly reports via text or voice. Share one report to multiple investors instantly.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
      </svg>
    ),
    title: 'One-Click Reuse',
    desc: 'Fill in your legal name, title, and signature once. Reuse across every deal and agreement without re-entering anything.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Escrow-Backed Payments',
    desc: 'Funds held by a licensed 3rd-party escrow provider. Released only after both parties sign. No side deals, no risk.',
  },
]

export default function AppFeatures() {
  return (
    <section id="app-features" style={{ padding: '96px 0', background: 'var(--cream)' }}>
      <div className="section-w">
        {/* Heading */}
        <div className="rv" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionLabel>Platform Features</SectionLabel>
          <h2 className="sh2" style={{ marginTop: 16 }}>
            Built for the deal,<br />not the <span className="et">paperwork.</span>
          </h2>
          <p className="sb" style={{ marginTop: 16, maxWidth: 520, margin: '16px auto 0' }}>
            Every feature on MonieMatch exists to make investing and growing a business easier, more transparent, and more trustworthy.
          </p>
        </div>

        {/* 2×2 Grid */}
        <div className="af-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="af-card rv">
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(229,160,74,.10)',
                marginBottom: 18,
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-.2px' }}>
                {f.title}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--dim)', margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 52 }}>
          <a href="/features" className="af-cta">
            Explore all features →
          </a>
        </div>
      </div>

      <style>{`
        .af-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .af-card {
          background: var(--bone, #f5f0e8);
          border: 1px solid rgba(28,24,19,.08);
          border-radius: 16px;
          padding: 28px 28px 32px;
        }
        .af-cta {
          display: inline-block;
          border: 1.5px solid var(--ink);
          background: transparent;
          color: var(--ink);
          padding: 14px 32px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          letter-spacing: -.1px;
          transition: background .18s, color .18s;
        }
        .af-cta:hover {
          background: var(--ink);
          color: var(--cream);
        }
        @media (max-width: 680px) {
          .af-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
