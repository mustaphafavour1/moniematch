'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NAV_LINKS } from '@/lib/constants'

// Routes that are static HTML files in public/ — must use <a>, not Next.js <Link>
const STATIC_ROUTES = ['/app']
function isStatic(href: string) {
  return STATIC_ROUTES.some(r => href.startsWith(r)) || href.startsWith('http')
}

export default function Nav() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [mounted,  setMounted]    = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  // Avoid hydration mismatch — render the non-scrolled state until mounted
  const glassed = mounted && scrolled

  return (
    <>
      <nav
        id="nav"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px var(--pad)',
          background: glassed ? 'rgba(250,250,248,.92)' : 'rgba(250,250,248,0)',
          backdropFilter: glassed ? 'blur(20px)' : 'blur(0px)',
          borderBottom: `1px solid ${glassed ? 'rgba(148,134,97,.12)' : 'transparent'}`,
          transition: 'background .45s, backdrop-filter .45s, border-color .45s',
        }}
      >
        {/* Logo — always Next.js Link (/ is a real Next.js page) */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' }}>
          <Image src="/logo.png" alt="MonieMatch" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>MonieMatch</span>
        </Link>

        {/* Desktop links */}
        <ul style={{ display: 'flex', alignItems: 'center', gap: 26, listStyle: 'none' }} className="nav-links-desk">
          {NAV_LINKS.map((link) =>
            isStatic(link.href) ? (
              <li key={link.href}>
                <a href={link.href} style={{ color: 'var(--dim)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim)')}
                >
                  {link.label}
                </a>
              </li>
            ) : (
              <li key={link.href}>
                <Link href={link.href} style={{ color: 'var(--dim)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim)')}
                >
                  {link.label}
                </Link>
              </li>
            )
          )}
        </ul>

        {/* CTA — static route */}
        <a href="/investor/onboarding" className="n-cta nav-cta-desk">
          Try A Match <span className="arr" style={{ marginLeft: 4 }}>→</span>
        </a>

        {/* Hamburger */}
        <button
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-hbg"
          style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, display: 'block', transition: 'all .3s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : '' }} />
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, display: 'block', transition: 'all .3s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, display: 'block', transition: 'all .3s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '' }} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, top: 64, zIndex: 99,
          background: 'rgba(250,250,248,.97)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
        }}>
          {NAV_LINKS.map((link) =>
            isStatic(link.href) ? (
              <a key={link.href} href={link.href} onClick={closeMenu}
                style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} onClick={closeMenu}
                style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            )
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 260, marginTop: 12 }}>
            <a href="/investor/onboarding" onClick={closeMenu}
              style={{ background: 'var(--ink)', color: '#fff', padding: '14px 24px', borderRadius: 100, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
            >
              I am an Investor →
            </a>
            <a href="/business/onboarding" onClick={closeMenu}
              style={{ background: 'transparent', color: 'var(--ink)', border: '1.5px solid rgba(28,24,19,.2)', padding: '14px 24px', borderRadius: 100, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
            >
              I own a Business →
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desk, .nav-cta-desk { display: none !important; }
          .nav-hbg { display: flex !important; }
        }
      `}</style>
    </>
  )
}
