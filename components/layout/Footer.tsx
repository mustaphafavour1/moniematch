// Static routes served from public/ — use plain <a>, not Next.js <Link>
const STATIC = new Set(['/join-investor', '/join-business', '/app', '/signin'])

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (STATIC.has(href) || href.startsWith('http')) {
    return <a href={href}>{children}</a>
  }
  // dynamic import to avoid top-level Link for trivial footer
  return <a href={href}>{children}</a>
}

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

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="fc">
      <h4>{title}</h4>
      {links.map(l => <FooterLink key={l.href} href={l.href}>{l.label}</FooterLink>)}
    </div>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,.05)', padding: '68px 0 32px' }}>
      <div className="section-w">
        <div className="ft-top">
          <div>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: '#fff' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="MonieMatch" width={28} height={28} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.3px' }}>MonieMatch</span>
            </a>
            <p style={{ fontSize: 13, color: 'rgba(247,241,232,.32)', lineHeight: 1.75, marginTop: 13, maxWidth: 250 }}>
              Matchmaking miracles for Nigerian small businesses and everyday mini-investors.
            </p>
          </div>
          <FooterCol title="Platform" links={platformLinks} />
          <FooterCol title="Company"  links={companyLinks} />
          <FooterCol title="Legal"    links={legalLinks} />
        </div>
        <div className="ft-bot">
          <p className="ft-copy">© 2026 MonieMatch Technologies Ltd. All rights reserved. Lagos, Nigeria.</p>
          <div className="ft-leg">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
