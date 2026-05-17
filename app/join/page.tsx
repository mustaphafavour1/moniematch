'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

/* ─── Inner component that reads search params ─── */
function JoinContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref') ?? ''
  const [stored, setStored] = useState(false)

  useEffect(() => {
    if (ref) {
      localStorage.setItem('moniematch_ref', ref)
      setStored(true)
    }
  }, [ref])

  return (
    <>
      {/* ── Hero ── */}
      <section style={{
        background: 'var(--ink)',
        padding: '120px var(--pad) 96px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {ref && (
            <span style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: 'var(--amber)',
              background: 'rgba(229,160,74,.12)',
              border: '1px solid rgba(229,160,74,.25)',
              borderRadius: 100,
              padding: '5px 14px',
              marginBottom: 28,
            }}>
              Invited with code: {ref}
            </span>
          )}
          <h1 style={{
            fontSize: 'clamp(32px,5vw,60px)',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-1.5px',
            lineHeight: 1.05,
            marginBottom: 24,
          }}>
            You&apos;ve been invited<br />
            <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>to MonieMatch</em>
          </h1>
          <p style={{
            fontSize: 17,
            color: 'rgba(247,241,232,.6)',
            lineHeight: 1.75,
            maxWidth: 520,
            margin: '0 auto 48px',
          }}>
            Someone who knows you thinks you&apos;d be a great fit on MonieMatch — the platform connecting Nigerian investors and businesses.
          </p>

          {/* ── CTA Cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            maxWidth: 640,
            margin: '0 auto',
          }}>
            {/* Investor card */}
            <div style={{
              background: 'rgba(247,241,232,.05)',
              border: '1px solid rgba(247,241,232,.12)',
              borderRadius: 20,
              padding: '32px 28px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <span style={{ fontSize: 28 }}>🌱</span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                  I&apos;m an Investor
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(247,241,232,.55)', lineHeight: 1.7 }}>
                  I have capital and I&apos;m looking for real small businesses to invest in.
                </p>
              </div>
              <a
                href="/investor/onboarding"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 22px',
                  borderRadius: 100,
                  background: 'var(--gold)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  alignSelf: 'flex-start',
                  marginTop: 4,
                }}
              >
                Join as an Investor →
              </a>
            </div>

            {/* Business card */}
            <div style={{
              background: 'rgba(247,241,232,.05)',
              border: '1px solid rgba(247,241,232,.12)',
              borderRadius: 20,
              padding: '32px 28px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <span style={{ fontSize: 28 }}>🏪</span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                  I own a Business
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(247,241,232,.55)', lineHeight: 1.7 }}>
                  I run a business and I&apos;m looking for investors who want to back my growth.
                </p>
              </div>
              <a
                href="/business/onboarding"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 22px',
                  borderRadius: 100,
                  background: 'var(--forest, #2d5a27)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  alignSelf: 'flex-start',
                  marginTop: 4,
                }}
              >
                Join as a Business →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{
        background: 'var(--cream)',
        padding: '80px var(--pad)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <span style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'var(--gold)',
            display: 'inline-block',
            marginBottom: 20,
          }}>
            How it works
          </span>
          <h2 style={{
            fontSize: 'clamp(24px,3.5vw,38px)',
            fontWeight: 800,
            color: 'var(--ink)',
            letterSpacing: '-1px',
            marginBottom: 40,
            lineHeight: 1.1,
          }}>
            From first match to first return
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'left' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{step.title}</p>
                  <p style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sign-in footer strip ── */}
      <div style={{
        background: 'var(--cream-d, #ece5d8)',
        borderTop: '1px solid rgba(28,24,19,.08)',
        padding: '22px var(--pad)',
        textAlign: 'center',
        fontSize: 14,
        color: 'var(--dim)',
      }}>
        Already have an account?{' '}
        <a href="/signin" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}>
          Sign in →
        </a>
      </div>
    </>
  )
}

const HOW_IT_WORKS = [
  {
    icon: '🎯',
    title: 'Match',
    desc: 'Our algorithm scores investor-business pairs across 5 factors. You see only the people most compatible with your goals.',
  },
  {
    icon: '💬',
    title: 'Chat & Negotiate',
    desc: 'Initiate deals, propose terms, and counter-offer — all inside MonieMatch. No WhatsApp confusion.',
  },
  {
    icon: '🤝',
    title: 'Sign & Grow',
    desc: 'Sign a digital agreement, transfer funds, and receive monthly revenue reports. Everything on the record.',
  },
]

/* ─── Suspense shell ─── */
function JoinFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(247,241,232,.4)', fontSize: 14 }}>Loading…</p>
    </div>
  )
}

export default function JoinPage() {
  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<JoinFallback />}>
          <JoinContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
