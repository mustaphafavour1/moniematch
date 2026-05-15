import SectionLabel from '@/components/ui/SectionLabel'
import { FEATURE_CARDS } from '@/lib/constants'
import type { FeatureCard } from '@/lib/types'

function ScoreVisual() {
  return (
    <div className="v-score">
      <svg className="v-ring-svg" viewBox="0 0 64 64">
        <circle className="v-ring-track" cx="32" cy="32" r="28" />
        <circle className="v-ring-fill" cx="32" cy="32" r="28" />
        <text className="v-ring-num" x="32" y="37" textAnchor="middle" fontFamily="Host Grotesk, sans-serif">94</text>
      </svg>
      <div className="v-bars">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="v-bar" />)}
      </div>
    </div>
  )
}

function PillsVerifiedVisual() {
  return (
    <div className="v-pills">
      <span className="vp a">Fashion ✓</span>
      <span className="vp b">Bakery ✓</span>
      <span className="vp c">Verified</span>
      <span className="vp a">Lagos</span>
      <span className="vp b">₦100k–500k</span>
      <span className="vp a">Monthly</span>
    </div>
  )
}

function ChatVisual() {
  return (
    <div className="v-chat">
      <div className="vm r">How much are you looking to invest?</div>
      <div className="vm s">₦200k. Revenue share works for me.</div>
      <div className="vm r">Deal. Let&apos;s sign. 🤝</div>
    </div>
  )
}

function ReportVisual() {
  return (
    <div className="v-report">
      <div className="vr-row"><span className="vr-l">Revenue this month</span><span className="vr-v">₦380,000</span></div>
      <div className="vr-row"><span className="vr-l">Investor return</span><span className="vr-v">₦20,000</span></div>
      <div className="vr-row"><span className="vr-l">Status</span><span className="vr-v green">✓ Submitted</span></div>
    </div>
  )
}

function PortfolioVisual() {
  return (
    <div className="v-port">
      <span className="v-port-n">₦1.2M</span>
      <span className="v-port-l">Portfolio Value</span>
    </div>
  )
}

function PillsReturnVisual() {
  return (
    <div className="v-pills">
      <span className="vp a">Monthly returns</span>
      <span className="vp c">Revenue share</span>
      <span className="vp b">Profit split</span>
    </div>
  )
}

const VISUALS: Record<FeatureCard['visual'], React.FC> = {
  'score':        ScoreVisual,
  'pills-verified': PillsVerifiedVisual,
  'chat':         ChatVisual,
  'report':       ReportVisual,
  'portfolio':    PortfolioVisual,
  'pills-return': PillsReturnVisual,
}

export default function Features() {
  return (
    <section id="features" style={{ padding: '96px 0', background: 'var(--ink-mid)' }}>
      <div className="section-w">
        <div className="fh rv" style={{ textAlign: 'center', marginBottom: 60 }}>
          <SectionLabel light>What MonieMatch Does</SectionLabel>
          <h2 className="sh2" style={{ color: '#fff', marginTop: 16 }}>
            Built for how Nigeria<br />actually <em className="em">does business.</em>
          </h2>
          <p className="sb" style={{ color: 'var(--dim-light)', maxWidth: 480, margin: '0 auto', marginTop: 16 }}>
            Six things we obsessed over so you don&apos;t have to think about them.
          </p>
        </div>

        <div className="bgrid">
          {FEATURE_CARDS.map((card, i) => {
            const Visual = VISUALS[card.visual]
            return (
              <div key={card.num} className={`bc rv d${i + 1}`}>
                <div className="bn">{card.num}</div>
                <div className="bv"><Visual /></div>
                <div className="bt">{card.title}</div>
                <p className="bd">{card.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
