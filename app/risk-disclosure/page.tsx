import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal & Risk Disclosure — MonieMatch',
  description: 'Important information about the risks of investing through MonieMatch.',
}

const SECTIONS = [
  {
    title: 'General disclaimer',
    body: `MonieMatch is a peer-to-peer investment matching platform that connects investors with small and medium-sized businesses in Nigeria. MonieMatch is <strong>not a licensed investment adviser, bank, or financial institution</strong>. We do not provide financial advice, and nothing on this platform constitutes a recommendation to invest in any business or opportunity.`,
  },
  {
    title: 'Investment risk',
    body: `All investments carry risk. When you invest through MonieMatch, you risk losing some or all of your invested capital. Small and medium-sized businesses are inherently higher-risk investments compared to publicly traded securities or bank deposits. Before investing, you should carefully consider:
    <ul style="margin:12px 0 0 20px;display:flex;flex-direction:column;gap:8px">
      <li>Your financial situation and ability to sustain losses</li>
      <li>The business's track record, revenue history, and management team</li>
      <li>The structure of the return (fixed, revenue share, equity) and associated risks</li>
      <li>General economic conditions and sector-specific risks</li>
      <li>Currency and inflation risk in Nigerian markets</li>
    </ul>`,
  },
  {
    title: 'No guaranteed returns',
    body: `Return structures advertised by businesses on MonieMatch — including fixed returns, revenue share agreements, or equity arrangements — are proposed terms only. <strong>MonieMatch makes no guarantee that any return will be realised.</strong> Actual returns depend entirely on the performance of the underlying business, which may be affected by factors beyond the control of either party.`,
  },
  {
    title: 'Due diligence is your responsibility',
    body: `MonieMatch provides verification services for certain documents (e.g. CAC registration, bank statements) as an informational service only. <strong>Verification does not constitute an endorsement</strong> of the business or an assurance of its viability. You are solely responsible for conducting your own due diligence before making any investment decision. We strongly encourage you to:
    <ul style="margin:12px 0 0 20px;display:flex;flex-direction:column;gap:8px">
      <li>Review all business documents carefully</li>
      <li>Ask questions directly in the chat with the business owner</li>
      <li>Seek independent legal or financial advice where appropriate</li>
      <li>Never invest more than you can afford to lose</li>
    </ul>`,
  },
  {
    title: 'Escrow and funds',
    body: `Investment funds transferred through MonieMatch are held in escrow by a licensed third-party escrow provider until the investment agreement has been signed by both parties. MonieMatch does not hold, manage, or control investor funds at any point. In the event of a dispute, escrow release is governed by the signed agreement and the escrow provider's terms.`,
  },
  {
    title: 'No secondary market',
    body: `Investments made through MonieMatch are <strong>illiquid</strong>. There is currently no secondary market for selling your investment interest to another party. You should assume that your funds will be locked for the full agreed investment period.`,
  },
  {
    title: 'Regulatory notice',
    body: `MonieMatch operates as a technology platform connecting parties. This platform is not currently regulated by the Central Bank of Nigeria (CBN), the Securities and Exchange Commission (SEC), or any other financial regulatory authority. By using MonieMatch, you acknowledge that you understand and accept the implications of engaging in unregulated peer-to-peer transactions. We recommend consulting a qualified Nigerian financial adviser before investing.`,
  },
  {
    title: 'Limitation of liability',
    body: `To the fullest extent permitted by applicable law, MonieMatch, its directors, employees, and affiliates shall not be liable for any direct, indirect, incidental, or consequential losses arising from your use of the platform or any investment you make through it. Our total liability in any dispute shall not exceed the platform fees paid by you in the 12 months preceding the claim.`,
  },
  {
    title: 'Acceptance',
    body: `By creating an account and using MonieMatch, you confirm that you have read, understood, and accepted this risk disclosure in full. If you do not agree with any part of this disclosure, please do not use the platform.`,
  },
]

export default function RiskDisclosurePage() {
  return (
    <div style={{ background: 'var(--snow)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ padding: '20px var(--pad)', borderBottom: '1px solid rgba(28,24,19,.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--ink)' }}>
          ← <span style={{ fontWeight: 700 }}>MonieMatch</span>
        </Link>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px var(--pad) 96px' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#C0392B' }}>Important</span>
        <h1 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, letterSpacing: '-1.5px', margin: '12px 0 8px' }}>
          Legal &amp; Risk Disclosure
        </h1>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20 }}>Last updated: January 2026</p>

        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '16px 20px', marginBottom: 48 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#7f1d1d', lineHeight: 1.65, fontWeight: 500 }}>
            Investing in small businesses carries significant risk, including the potential loss of your entire investment.
            Please read this disclosure carefully before investing through MonieMatch.
          </p>
        </div>

        {SECTIONS.map((s, i) => (
          <section key={i} style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 14, color: 'var(--ink)' }}>{s.title}</h2>
            <div style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.78 }} dangerouslySetInnerHTML={{ __html: s.body }} />
          </section>
        ))}

        <div style={{ borderTop: '1px solid rgba(28,24,19,.1)', paddingTop: 32, marginTop: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.7 }}>
            Questions? Contact us at <a href="mailto:legal@moniematch.com" style={{ color: 'var(--ink)' }}>legal@moniematch.com</a>
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <Link href="/privacy" style={{ fontSize: 13, color: 'var(--ink)', textDecoration: 'underline' }}>Privacy Policy</Link>
            <Link href="/terms"   style={{ fontSize: 13, color: 'var(--ink)', textDecoration: 'underline' }}>Terms of Use</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
