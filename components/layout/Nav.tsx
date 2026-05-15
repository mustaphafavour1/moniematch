'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NAV_LINKS } from '@/lib/constants'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav
        id="nav"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px var(--pad)',
          background: scrolled ? 'rgba(250,250,248,.92)' : 'rgba(250,250,248,0)',
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
          borderBottom: `1px solid ${scrolled ? 'rgba(148,134,97,.12)' : 'transparent'}`,
          transition: 'background .45s, backdrop-filter .45s, border-color .45s',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' }}>
          <Image src="/logo.png" alt="MonieMatch" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>MonieMatch</span>
        </Link>

        {/* Desktop links */}
        <ul className="n-links" style={{ display: 'flex', alignItems: 'center', gap: 26, listStyle: 'none' }}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="n-links a" style={{ color: 'var(--dim)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--dim)')}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/join-investor" className="n-cta" style={{ display: 'flex' }}>
          Try A Match <span className="arr" style={{ marginLeft: 4 }}>→</span>
        </Link>

        {/* Hamburger */}
        <button
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          className="hbg-btn"
        >
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, transition: 'all .3s', display: 'block', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : '' }} />
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, transition: 'all .3s', display: 'block', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: 22, height: 2, background: 'var(--ink)', borderRadius: 2, transition: 'all .3s', display: 'block', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, top: 64, zIndex: 99,
          background: 'rgba(250,250,248,.97)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
        }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMenu}
              style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 260, marginTop: 12 }}>
            <Link href="/join-investor" onClick={closeMenu}
              style={{ background: 'var(--ink)', color: '#fff', padding: '14px 24px', borderRadius: 100, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
            >
              I am an Investor →
            </Link>
            <Link href="/join-business" onClick={closeMenu}
              style={{ background: 'transparent', color: 'var(--ink)', border: '1.5px solid rgba(28,24,19,.2)', padding: '14px 24px', borderRadius: 100, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
            >
              I own a Business →
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          nav ul, nav .n-cta { display: none !important; }
          nav .hbg-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
