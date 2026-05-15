import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use — MonieMatch',
}

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--snow)', minHeight: '100vh' }}>
      <nav style={{ padding: '20px var(--pad)', borderBottom: '1px solid rgba(28,24,19,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ink)' }}>
          ← <span style={{ fontWeight: 700 }}>MonieMatch</span>
        </Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px var(--pad) 96px' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)' }}>Legal</span>
        <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', margin: '12px 0 8px' }}>Terms of Use</h1>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 56 }}>Last updated: January 2026</p>

        {TERMS_SECTIONS.map((s, i) => (
          <section key={i} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 14 }}>{s.title}</h2>
            <div style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.78 }} dangerouslySetInnerHTML={{ __html: s.body }} />
          </section>
        ))}
      </div>
    </div>
  )
}

const TERMS_SECTIONS = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using MonieMatch ("the Platform"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform. These Terms constitute a legally binding agreement between you and MonieMatch Technologies Ltd.' },
  { title: '2. Description of Service', body: 'MonieMatch is a digital matchmaking platform that connects individual investors with small business owners in Nigeria. We facilitate the discovery, negotiation, and documentation of investment deals. MonieMatch does not hold, transfer, or guarantee any funds.' },
  { title: '3. User Eligibility', body: 'You must be at least 18 years of age to use MonieMatch. By registering, you confirm that the information you provide is accurate, current, and complete. MonieMatch reserves the right to suspend or terminate accounts found to contain false information.' },
  { title: '4. Investor Terms', body: '<strong>Risk Acknowledgement:</strong> Investing in small businesses carries significant risk, including the possible loss of your entire investment. Past performance of any business on the platform is not indicative of future results.<br/><br/><strong>Due Diligence:</strong> While MonieMatch verifies basic business information, investors are responsible for conducting their own due diligence before committing funds.<br/><br/><strong>No Guarantees:</strong> MonieMatch does not guarantee investment returns, business performance, or repayment of capital.' },
  { title: '5. Business Owner Terms', body: 'By listing on MonieMatch, you confirm that: your business is real, operational, and generates revenue; all information provided is accurate and not misleading; you have the legal authority to enter into investment agreements; and you will submit monthly revenue reports as agreed in any signed deal.' },
  { title: '6. Deal Agreements', body: 'Deals signed through MonieMatch\'s in-app agreement system constitute legally binding contracts between investors and business owners. MonieMatch facilitates but is not a party to these agreements. Disputes arising from deals are the responsibility of the parties involved. MonieMatch may assist in mediation at its discretion.' },
  { title: '7. Prohibited Activities', body: 'Users may not: create false or misleading profiles; use the platform for money laundering or illegal activities; attempt to circumvent the platform to deal directly without documentation; harass or threaten other users; reverse-engineer or scrape the platform; or post content that is defamatory, fraudulent, or infringes third-party rights.' },
  { title: '8. Platform Fees', body: 'MonieMatch\'s current fee structure is disclosed at the point of deal signing. We reserve the right to introduce or modify fees with 30 days\' notice to registered users. Existing deals are not affected by fee changes.' },
  { title: '9. Content & Intellectual Property', body: 'All platform content, design, code, and branding is the property of MonieMatch Technologies Ltd. Users retain ownership of content they upload but grant MonieMatch a license to use such content for platform operations and marketing purposes.' },
  { title: '10. Limitation of Liability', body: 'To the maximum extent permitted by Nigerian law, MonieMatch shall not be liable for: any investment losses; business failures; defaults by business owners; damages arising from platform unavailability; or indirect, consequential, or punitive damages of any kind.' },
  { title: '11. Risk Disclaimer', body: '<strong>IMPORTANT RISK WARNING:</strong> Investment in small and micro businesses involves substantial risk. You should only invest money you can afford to lose. MonieMatch is not a licensed financial institution and does not provide regulated financial advice. Please seek independent financial advice before making investment decisions.' },
  { title: '12. Governing Law', body: 'These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria.' },
  { title: '13. Changes to Terms', body: 'MonieMatch reserves the right to modify these Terms at any time. Material changes will be communicated via email and platform notification. Continued use after notification constitutes acceptance of the revised Terms.' },
  { title: '14. Contact', body: 'For questions about these Terms, contact us at <a href="mailto:admin@moniematch.com" style="color:var(--amber)">admin@moniematch.com</a>.' },
]
