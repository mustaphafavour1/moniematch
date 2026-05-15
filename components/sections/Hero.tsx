export default function Hero() {
  return (
    <section id="hero">
      <style>{`
        #hero {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          background-image: url('/images/hero-bg-web.png');
          background-size: cover;
          background-position: right center;
          background-repeat: no-repeat;
        }
        #hero::before {
          content: '';
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(90deg,
            rgba(250,250,248,.84) 0%,
            rgba(250,250,248,.42) 48%,
            transparent 68%
          );
        }
        @media (max-width: 1024px) {
          #hero {
            background-image: url('/images/hero-bg-tablet.png');
            background-position: center bottom;
          }
          #hero::before {
            background: linear-gradient(180deg,
              rgba(250,250,248,.96) 0%,
              rgba(250,250,248,.88) 52%,
              transparent 100%
            );
          }
        }
        @media (max-width: 640px) {
          #hero {
            background-image: url('/images/hero-bg-mobile.png');
            background-position: center bottom;
            min-height: 100svh;
            align-items: flex-start;
          }
          #hero::before {
            background: linear-gradient(180deg,
              rgba(250,250,248,1)   0%,
              rgba(250,250,248,.98) 40%,
              rgba(250,250,248,.65) 62%,
              transparent           100%
            );
          }
          .h-inner { padding-top: 96px !important; padding-bottom: 40px !important; }
          .h-head  { font-size: clamp(34px, 9vw, 46px) !important; }
          .h-sub   { font-size: 14px !important; }
        }
      `}</style>

      <div className="h-inner" style={{ position: 'relative', zIndex: 2, padding: '140px var(--pad) 80px', maxWidth: 620 }}>

        <div className="h-pill">
          <span className="h-dot" />
          Nigeria&apos;s Investment Matching Platform
        </div>

        <h1 className="h-head">
          <span className="line">
            <span className="w" style={{ animationDelay: '.28s' }}>Connecting</span>
          </span>
          <span className="line">
            <span className="w" style={{ animationDelay: '.38s' }}>Capital</span>
            {' '}
            <span className="w" style={{ animationDelay: '.46s' }}>to</span>
            {' '}
            <span className="w" style={{ animationDelay: '.54s' }}>
              <em className="em">Real-World</em>
            </span>
          </span>
          <span className="line">
            <span className="w" style={{ animationDelay: '.68s' }}>Hustle.</span>
          </span>
        </h1>

        <p className="h-sub">
          A trusted platform connecting everyday investors with vetted small businesses
          raising capital to grow — structured deals, monthly reports, real returns.
        </p>

        <div className="h-ctas">
          <a href="/join-investor" className="btn-dark">
            I am an Investor <span className="arr">→</span>
          </a>
          <a href="/join-business" className="btn-outline">
            I own a Business <span className="arr">→</span>
          </a>
        </div>

        <a href="#waitlist" className="h-wl">
          <span>Notify me when the app drops</span> ↓
        </a>
      </div>
    </section>
  )
}
