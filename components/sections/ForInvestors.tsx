import Image from 'next/image'
import SectionLabel from '@/components/ui/SectionLabel'
import { INVESTOR_BENEFITS } from '@/lib/constants'

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3.01" />
    </svg>
  )
}

function InvestorCard() {
  return (
    <div style={{ position: 'relative', height: 310, display: 'flex', justifyContent: 'center' }}>
      {/* Stacked cards */}
      <div className="ic ic-b" />
      <div className="ic ic-m" />
      <div className="ic ic-f">
        <Image src="/logo.png" alt="" width={80} height={28} style={{ objectFit: 'contain', marginBottom: 12 }} />
        <div className="il">Active Investment</div>
        <div className="ia">₦500,000</div>
        <div className="ib2">Adaeze&apos;s Confectionery · Lagos</div>
        <div className="ibadge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a07020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          +₦20,000 / month
        </div>
        <div className="mr">94<small>/ 99</small></div>
      </div>
    </div>
  )
}

export default function ForInvestors() {
  return (
    <section id="investors" style={{ padding: '96px 0', background: 'var(--snow)' }}>
      <div className="section-w">
        <div className="sg">
          {/* Copy */}
          <div className="rl">
            <SectionLabel>For Investors</SectionLabel>
            <h2 className="sh2" style={{ marginTop: 16 }}>
              I might not be a Senior Investor.<br />But my investment <em className="em">is.</em>
            </h2>
            <p className="sb" style={{ marginTop: 24 }}>
              Stop watching your money earn 4% a year. MonieMatch deploys your capital into verified
              small businesses — structured terms, monthly reports, real returns.
            </p>

            <ul className="bl">
              {INVESTOR_BENEFITS.map((b, i) => (
                <li key={i} className="bi">
                  <CheckIcon />
                  <span className="bt2"><strong>{b.strong}</strong>{b.rest}</span>
                </li>
              ))}
            </ul>

            <a href="/investor/onboarding" className="btn-dark" style={{ marginTop: 34, display: 'inline-flex' }}>
              Start Investing →
            </a>
          </div>

          {/* Card visual */}
          <div className="rr">
            <InvestorCard />
          </div>
        </div>
      </div>
    </section>
  )
}
