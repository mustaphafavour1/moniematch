import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'About Us — MonieMatch',
  description: 'Built by investors, for investors. Learn the story behind MonieMatch.',
}

const CORE_VALUES = [
  { label: 'Innovation',            desc: 'We build what has never been built for this market.' },
  { label: 'Speed',                 desc: 'Fast matches, fast deals, fast growth.' },
  { label: 'User-Focus',            desc: 'Every feature is driven by real user feedback.' },
  { label: 'Financial Safety',      desc: 'Protecting investor capital is non-negotiable.' },
  { label: 'Community Development', desc: 'We grow when the businesses around us grow.' },
  { label: 'Internetworking',       desc: 'Connecting people, capital, and opportunity.' },
  { label: 'Excellence',            desc: 'Good enough is never good enough for us.' },
]

const TEAM_MEMBERS = [
  { initials: 'JA', name: 'Founder & CEO',    color: 'var(--amber)' },
  { initials: 'CO', name: 'Product & Design',  color: '#6fcf97' },
  { initials: 'TK', name: 'Engineering',       color: 'var(--terra)' },
  { initials: 'EB', name: 'Operations',        color: 'var(--gold)' },
]

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <Nav />

      {/* Hero */}
      <section style={{ paddingTop: 80, background: 'var(--ink)', padding: '140px var(--pad) 96px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: 'var(--gold)',
            padding: '5px 14px', border: '1px solid rgba(148,134,97,.28)', borderRadius: 100, marginBottom: 24,
          }}>
            About MonieMatch
          </span>
          <h1 style={{
            fontSize: 'clamp(40px,5.5vw,72px)', fontWeight: 800, letterSpacing: '-2.5px',
            color: '#fff', lineHeight: 1.02, marginBottom: 28, maxWidth: 780,
          }}>
            Built by investors,<br /><em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>for investors.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(247,241,232,.55)', lineHeight: 1.75, maxWidth: 620 }}>
            We&apos;re a small team of Nigerian innovators based in Lagos who have faced this problem first-hand — and decided to build the solution.
          </p>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '96px 0', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--pad)' }}>
          <span style={{
            display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', color: 'var(--gold)',
            padding: '5px 14px', border: '1px solid rgba(148,134,97,.28)', borderRadius: 100, marginBottom: 20,
          }}>
            Our Team
          </span>
          <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--ink)', marginBottom: 48 }}>
            Small team. Real builders.
          </h2>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {TEAM_MEMBERS.map(m => (
              <div key={m.initials} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                padding: '28px 24px', background: '#fff',
                border: '1px solid rgba(28,24,19,.07)', borderRadius: 20, minWidth: 140,
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: m.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: 'var(--ink)',
                }}>
                  {m.initials}
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--dim)', textAlign: 'center', margin: 0 }}>{m.name}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--dim)', marginTop: 20, fontStyle: 'italic' }}>
            And a wider crew of advisors, investors, and community builders.
          </p>
        </div>
      </section>

      {/* Story / Mission / Vision */}
      <section style={{ padding: '96px 0', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--pad)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
          <div>
            <span style={{
              display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16,
            }}>
              Our Story
            </span>
            <p style={{ fontSize: 15.5, color: 'var(--dim)', lineHeight: 1.82 }}>
              MonieMatch was built by fellow mini-investors to serve small businesses and connect them to capital for growth. Our founder is also MonieMatch&apos;s first investor — he used the product to make an actual investment in a small business.
            </p>
            <p style={{ fontSize: 15.5, color: 'var(--dim)', lineHeight: 1.82, marginTop: 16 }}>
              The platform was built based on real feedback and input from current investors who have invested and are currently investing millions of naira into small businesses. Some have experienced the typical losses that come with informal small business investing. MonieMatch exists to prevent that from happening again.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div>
              <span style={{
                display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14,
              }}>
                Our Mission
              </span>
              <p style={{ fontSize: 15.5, color: 'var(--dim)', lineHeight: 1.78 }}>
                To help investors get great value for their money, and help businesses grow through access to capital and tools that make it easy for businesses to keep their end of the deal.
              </p>
            </div>
            <div>
              <span style={{
                display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14,
              }}>
                Our Vision
              </span>
              <p style={{ fontSize: 15.5, color: 'var(--dim)', lineHeight: 1.78 }}>
                To be the #1 reliable platform that powers the growth of small businesses and solopreneurs across Nigeria.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section style={{ padding: '96px 0', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--pad)' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-block', fontSize: 10.5, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', color: 'var(--gold)',
              padding: '5px 14px', border: '1px solid rgba(148,134,97,.28)', borderRadius: 100, marginBottom: 16,
            }}>
              What we stand for
            </span>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--ink)' }}>
              Our Core Values
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {CORE_VALUES.map((v, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid rgba(28,24,19,.07)',
                borderRadius: 18, padding: '28px 24px',
                transition: 'all .3s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(148,134,97,.1)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginBottom: 14,
                  fontSize: 16, fontWeight: 800, color: 'var(--gold)',
                }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, letterSpacing: '-.2px' }}>
                  {v.label}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--dim)', lineHeight: 1.65, margin: 0 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 0', background: 'var(--ink-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 var(--pad)', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#fff', marginBottom: 16 }}>
            Questions? We&apos;d love to hear from you.
          </h2>
          <p style={{ fontSize: 15.5, color: 'rgba(247,241,232,.5)', marginBottom: 36 }}>
            We&apos;re a small team and we actually read our emails.
          </p>
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 32px', borderRadius: 100,
            background: 'var(--amber)', color: 'var(--ink)',
            fontWeight: 700, fontSize: 15, textDecoration: 'none', transition: 'all .25s',
          }}>
            Get in touch <span style={{ marginLeft: 2 }}>→</span>
          </Link>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .about-smv { grid-template-columns: 1fr !important; }
          .about-vals { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 520px) {
          .about-vals { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
