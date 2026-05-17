'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

type Tab = 'all' | 'businesses' | 'investors'

interface Feature {
  icon: string
  title: string
  desc: string
  audience: 'both' | 'businesses' | 'investors'
}

const FEATURES: Feature[] = [
  // Both / All
  { icon: '🎯', title: 'Smart Matching Algorithm',       desc: '5-factor engine matches investors with the right businesses automatically. Compatibility score out of 99.',                          audience: 'both' },
  { icon: '💬', title: 'In-App Messaging',               desc: 'Chat directly with investors or businesses, negotiate and agree terms in one place. No WhatsApp confusion.',                        audience: 'both' },
  { icon: '✍️', title: 'Deal Signing & Agreements',      desc: 'Sign deals in-app; all terms captured digitally. Every naira accounted for. No back-and-forth confusion.',                         audience: 'both' },
  { icon: '🔒', title: 'Escrow Payments',                desc: '3rd-party escrow holds funds until both parties sign and agree. Funds release only on mutual agreement.',                           audience: 'both' },
  { icon: '⏰', title: 'Automated Reminders & Tips',     desc: 'Smart nudges for reporting deadlines, payment due dates, and deal milestones. Never miss a beat.',                                  audience: 'both' },

  // Businesses
  { icon: '📝', title: 'Easy Reporting',                 desc: 'Submit monthly reports via text, voice, or images. Share the same report to multiple investors at once with one tap.',              audience: 'businesses' },
  { icon: '📁', title: 'Business Profile & Document Hub',desc: 'Upload your business info, documents, and bank statements once. Share with any investor instantly.',                                audience: 'businesses' },
  { icon: '🖼️', title: 'Business Banner & Branding',    desc: 'Upload a banner image and build a professional profile that attracts the right investors.',                                          audience: 'businesses' },
  { icon: '🔄', title: 'One-click Contract Reuse',       desc: 'Fill in your legal name, title, and signature once. Reuse on every deal without re-entering.',                                     audience: 'businesses' },
  { icon: '📊', title: 'Investor Management Dashboard',  desc: 'See all your active investors, deal statuses, and communications in one clean view.',                                               audience: 'businesses' },
  { icon: '✅', title: 'Verified Business Badge',        desc: 'Get verified (CAC, bank statements) to boost investor trust and match quality.',                                                    audience: 'businesses' },

  // Investors
  { icon: '📈', title: 'Live Portfolio Tracking',        desc: 'All your active deals, returns, and performance in one dashboard. Know exactly where every naira is working.',                     audience: 'investors' },
  { icon: '🤝', title: 'Offer & Counter-Offer Engine',   desc: 'Make offers, counter, and negotiate in structured steps. Amounts and splits auto-calculated.',                                     audience: 'investors' },
  { icon: '💡', title: 'Flexible Return Structures',     desc: 'Choose fixed monthly returns, revenue share, or equity — negotiated per deal.',                                                    audience: 'investors' },
  { icon: '🛡️', title: 'Verified Business Access',      desc: 'Only browse businesses that have been vetted and verified on the platform. No ghost listings.',                                    audience: 'investors' },
  { icon: '📄', title: 'Report Management',              desc: 'Receive and review monthly business reports. Stay informed on every naira you have deployed.',                                     audience: 'investors' },
  { icon: '🗓️', title: 'Reporting Cadence Preferences', desc: 'Set your preferred reporting frequency per deal. Weekly, bi-weekly, or monthly — your call.',                                     audience: 'investors' },
]

const COMING_SOON = [
  { icon: '🤖', title: 'Automated Bank Statement Analysis', desc: 'AI-powered analysis of financial records for better due diligence.' },
  { icon: '📋', title: 'Faster CAC Registration',           desc: 'Streamlined CAC registration support for businesses on the platform.' },
  { icon: '🎓', title: 'Business Consultation & Tips',      desc: 'Expert guidance and actionable tips for growing your business.' },
  { icon: '✨', title: 'And lots more...',                   desc: 'We build fast. The best features are still being cooked.' },
]

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',        label: 'All Features' },
  { id: 'businesses', label: 'For Businesses' },
  { id: 'investors',  label: 'For Investors' },
]

function filterFeatures(features: Feature[], tab: Tab): Feature[] {
  if (tab === 'all') return features
  if (tab === 'businesses') return features.filter(f => f.audience === 'businesses' || f.audience === 'both')
  return features.filter(f => f.audience === 'investors' || f.audience === 'both')
}

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const visible = filterFeatures(FEATURES, activeTab)

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />

      {/* Hero */}
      <section style={{ paddingTop: 80, background: 'var(--ink)', padding: '140px var(--pad) 96px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: 'var(--gold)',
            padding: '5px 14px', border: '1px solid rgba(148,134,97,.28)', borderRadius: 100, marginBottom: 24,
          }}>
            Platform Features
          </span>
          <h1 style={{
            fontSize: 'clamp(38px,5.5vw,70px)', fontWeight: 800, letterSpacing: '-2.5px',
            color: '#fff', lineHeight: 1.03, marginBottom: 24,
          }}>
            Everything you need to<br />
            <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>invest and grow.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(247,241,232,.5)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto' }}>
            Built from real investor pain. Designed for the Nigerian informal economy.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 0 96px', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--pad)' }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'flex', gap: 4, background: 'rgba(28,24,19,.07)',
              borderRadius: 100, padding: 4,
            }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '10px 24px', borderRadius: 100,
                    fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: activeTab === t.id ? 'var(--ink)' : 'transparent',
                    color: activeTab === t.id ? '#fff' : 'var(--dim)',
                    transition: 'all .3s cubic-bezier(.16,1,.3,1)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {visible.map((f, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid rgba(28,24,19,.07)',
                borderRadius: 20, padding: '28px 24px',
                transition: 'all .3s',
                position: 'relative', overflow: 'hidden',
              }}>
                {f.audience !== 'both' && (
                  <span style={{
                    position: 'absolute', top: 14, right: 14,
                    fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 100,
                    background: f.audience === 'businesses' ? 'rgba(180,90,60,.08)' : 'rgba(148,134,97,.1)',
                    color: f.audience === 'businesses' ? 'var(--terra)' : 'var(--gold)',
                    border: `1px solid ${f.audience === 'businesses' ? 'rgba(180,90,60,.2)' : 'rgba(148,134,97,.22)'}`,
                  }}>
                    {f.audience === 'businesses' ? 'Businesses' : 'Investors'}
                  </span>
                )}
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-.2px', paddingRight: 60 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--dim)', lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section style={{ padding: '80px 0 96px', background: 'var(--ink-mid)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--pad)' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', color: 'rgba(229,160,74,.6)',
              padding: '5px 14px', border: '1px solid rgba(229,160,74,.2)', borderRadius: 100, marginBottom: 16,
            }}>
              On the roadmap
            </span>
            <h2 style={{ fontSize: 'clamp(26px,3vw,40px)', fontWeight: 800, letterSpacing: '-1.2px', color: 'rgba(247,241,232,.7)' }}>
              Coming soon
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, opacity: 0.72 }}>
            {COMING_SOON.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 18, padding: '24px 20px', position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  fontSize: 8.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
                  padding: '3px 8px', borderRadius: 100,
                  background: 'rgba(148,134,97,.12)', color: 'var(--gold)',
                  border: '1px solid rgba(148,134,97,.2)',
                }}>
                  Soon
                </span>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: 'rgba(247,241,232,.7)', marginBottom: 6, letterSpacing: '-.2px' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 12.5, color: 'rgba(247,241,232,.35)', lineHeight: 1.62, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .feat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .soon-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .feat-grid { grid-template-columns: 1fr !important; }
          .soon-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
