export default function Hero() {
  return (
    <section id="hero">
      <div className="h-inner">

        <h1 className="h-head">
          <span className="line">
            <span className="w" style={{ animationDelay: '.18s' }}>Connecting</span>
          </span>
          <span className="line">
            <span className="w" style={{ animationDelay: '.30s' }}>Capital</span>
            {' '}
            <span className="w" style={{ animationDelay: '.40s' }}>to</span>
            {' '}
            <span className="w hero-real" style={{ animationDelay: '.52s' }}>Real-World</span>
          </span>
          <span className="line">
            <span className="w" style={{ animationDelay: '.66s' }}>Hustle.</span>
          </span>
        </h1>

        <p className="h-sub">
          A trusted platform connecting everyday investors with vetted small businesses
          raising capital to grow — structured deals, monthly reports, real returns.
        </p>

        <div className="h-ctas">
          <a href="/investor/onboarding" className="btn-dark">
            I am an Investor <span className="arr">→</span>
          </a>
          <a href="/business/onboarding" className="btn-outline">
            I own a Business <span className="arr">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
