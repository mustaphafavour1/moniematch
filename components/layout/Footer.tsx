import Link from 'next/link'
import Image from 'next/image'

const platformLinks = [
  { label: 'For Investors',   href: '/join-investor' },
  { label: 'For Businesses',  href: '/join-business' },
  { label: 'Web App',         href: '/app' },
  { label: 'Sign In',         href: '/signin' },
]
const companyLinks = [
  { label: 'About',           href: '#about-us' },
  { label: 'How It Works',    href: '#how-it-works' },
  { label: 'FAQ',             href: '#faq' },
  { label: 'Contact',         href: '#contact' },
]
const legalLinks = [
  { label: 'Privacy Policy',  href: '/privacy' },
  { label: 'Terms of Use',    href: '/terms' },
  { label: 'Risk Disclosure', href: '#' },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,.05)', padding: '68px 0 32px' }}>
      <div className="section-w">
        <div className="ft-top">
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: '#fff' }}>
              <Image src="/logo.png" alt="MonieMatch" width={28} height={28} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.3px' }}>MonieMatch</span>
            </Link>
            <p style={{ fontSize: 13, color: 'rgba(247,241,232,.32)', lineHeight: 1.75, marginTop: 13, maxWidth: 250 }}>
              Matchmaking miracles for Nigerian small businesses and everyday mini-investors.
            </p>
          </div>

          {/* Columns */}
          <FooterCol title="Platform" links={platformLinks} />
          <FooterCol title="Company"  links={companyLinks} />
          <FooterCol title="Legal"    links={legalLinks} />
        </div>

        <div className="ft-bot">
          <p className="ft-copy">© 2026 MonieMatch Technologies Ltd. All rights reserved. Lagos, Nigeria.</p>
          <div className="ft-leg">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="fc">
      <h4>{title}</h4>
      {links.map((l) => (
        <Link key={l.href} href={l.href}>{l.label}</Link>
      ))}
    </div>
  )
}
