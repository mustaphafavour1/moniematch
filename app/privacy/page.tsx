import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — MonieMatch',
}

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--snow)', minHeight: '100vh' }}>
      {/* Simple nav */}
      <nav style={{ padding: '20px var(--pad)', borderBottom: '1px solid rgba(28,24,19,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ink)' }}>
          ← <span style={{ fontWeight: 700 }}>MonieMatch</span>
        </Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px var(--pad) 96px' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)' }}>Legal</span>
        <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', margin: '12px 0 8px' }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 56 }}>Last updated: January 2026</p>

        {PRIVACY_SECTIONS.map((s, i) => (
          <section key={i} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 14, color: 'var(--ink)' }}>{s.title}</h2>
            <div style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.78 }} dangerouslySetInnerHTML={{ __html: s.body }} />
          </section>
        ))}
      </div>
    </div>
  )
}

const PRIVACY_SECTIONS = [
  { title: '1. Introduction', body: 'MonieMatch Technologies Ltd ("MonieMatch", "we", "our", or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at <a href="https://www.moniematch.com" style="color:var(--amber)">www.moniematch.com</a> and use our platform services.' },
  { title: '2. Information We Collect', body: '<strong>Personal Information:</strong> Name, email address, phone number, BVN (for identity verification), business registration details, bank account information for transactions, profile photos and business images.<br/><br/><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent on pages, device information, and referring URLs.<br/><br/><strong>Business Information:</strong> Business name, category, revenue figures, funding needs, and monthly reports submitted through our platform.' },
  { title: '3. How We Use Your Information', body: 'We use the information we collect to: provide and maintain our matching platform; process investor-business deals and agreements; verify business and investor identities; facilitate communication between matched parties; send transactional and notification emails; improve and personalise your experience on MonieMatch; comply with legal obligations; and detect and prevent fraud.' },
  { title: '4. Information Sharing', body: 'We do not sell, trade, or rent your personal information to third parties. We may share your information with: matched investors or businesses (only the information necessary for deal facilitation); service providers who assist us in operating the platform (Supabase for data storage, payment processors); and legal authorities when required by law.' },
  { title: '5. Data Security', body: 'We implement industry-standard security measures including encryption of data in transit and at rest, secure authentication via Supabase, row-level security on all database operations, and regular security audits. However, no method of transmission over the Internet is 100% secure.' },
  { title: '6. Data Retention', body: 'We retain your personal information for as long as your account is active or as needed to provide services. Deal records and signed agreements are retained for a minimum of 5 years for legal compliance. You may request deletion of your account and associated data by contacting us at hello@moniematch.com.' },
  { title: '7. Your Rights', body: 'You have the right to: access the personal information we hold about you; correct inaccurate information; request deletion of your data; object to our processing of your data; withdraw consent at any time; and lodge a complaint with the Nigeria Data Protection Commission (NDPC).' },
  { title: '8. Cookies', body: 'We use essential cookies to keep you logged in and maintain your session. We do not currently use advertising or tracking cookies. You can control cookie settings through your browser preferences.' },
  { title: '9. Third-Party Links', body: 'Our platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their privacy policies.' },
  { title: '10. Children\'s Privacy', body: 'MonieMatch is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors.' },
  { title: '11. Changes to This Policy', body: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the updated policy.' },
  { title: '12. Contact Us', body: 'For any questions about this Privacy Policy or our data practices, please contact us at:<br/><br/><strong>MonieMatch Technologies Ltd</strong><br/>Email: <a href="mailto:hello@moniematch.com" style="color:var(--amber)">hello@moniematch.com</a><br/>Lagos, Nigeria' },
]
