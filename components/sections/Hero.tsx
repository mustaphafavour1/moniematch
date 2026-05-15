import Link from 'next/link'

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Responsive bg via CSS */}
      <style>{`
        #hero {
          background-image: url('/images/hero-bg-web.png');
          background-size: cover;
          background-position: right center;
          background-repeat: no-repeat;
        }
        #hero::before {
          content: '';
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(90deg, rgba(250,250,248,.72) 0%, rgba(250,250,248,.3) 45%, transparent 65%);
        }
        @media (max-width: 1024px) {
          #hero {
            background-image: url('/images/hero-bg-tablet.png');
            background-position: center bottom;
          }
          #hero::before {
            background: linear-gradient(180deg, rgba(250,250,248,.96) 0%, rgba(250,250,248,.85) 50%, transparent 100%);
          }
        }
        @media (max-width: 640px) {
          #hero {
            background-image: url('/images/hero-bg-mobile.png');
            background-position: center bottom;
            min-height: 100svh;
          }
          #hero::before {
            background: linear-gradient(180deg, rgba(250,250,248,1) 0%, rgba(250,250,248,.88) 42%, rgba(250,250,248,.2) 72%, transparent 100%);
          }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 2, padding: '140px var(--pad) 80px', maxWidth: 600 }}>
        {/* Pill badge */}
        <div className="h-pill">
          <span className="h-dot" />
          Nigeria&apos;s Investment Matching Platform
        </div>

        {/* Headline */}
        <h1 className="h-head">
          <span className="line">
            <span className="w" style={{ animationDelay: '.28s' }}>Meet</span>
            &nbsp;
            <span className="w" style={{ animationDelay: '.38s' }}>your</span>
            &nbsp;
            <span className="w" style={{ animationDelay: '.48s' }}>next</span>
          </span>
          <span className="line">
            <span className="w fundmate-wrap" style={{ animationDelay: '.6s' }}>
              <span className="soul-cross">Soul</span>
              <span className="fund-text">Fund</span>
              <span className="mate-text">Mate</span>
            </span>
          </span>
          <span className="line">
            <span className="w" style={{ animationDelay: '.78s' }}>today.</span>
          </span>
        </h1>

        <p className="h-sub">
          We match Investors with small but already-profitable businesses and facilitate
          win-win deals for both parties.
        </p>

        <div className="h-ctas">
          <Link href="/join-investor" className="btn-dark">
            I am an Investor <span className="arr">→</span>
          </Link>
          <Link href="/join-business" className="btn-outline">
            I own a Business <span className="arr">→</span>
          </Link>
        </div>

        <Link href="#waitlist" className="h-wl">
          <span>Notify me when the app drops</span> ↓
        </Link>
      </div>
    </section>
  )
}
