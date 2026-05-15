import SectionLabel from '@/components/ui/SectionLabel'
import { PROBLEM_PAIRS } from '@/lib/constants'
import type { ProblemPair } from '@/lib/types'

// Exact SVG path data from the design files
// Left container (white panel) — 560×228 viewBox
const PATH_LEFT = "M539.177 228C551.608 228 561.028 216.78 558.875 204.537L525.825 16.5371C524.143 6.97399 515.836 0 506.127 0L20 0C8.95431 0 0 8.95431 0 20L0 208C0 219.046 8.9543 228 20 228L539.177 228Z"
// Right container (dark panel) — 560×228 viewBox
const PATH_RIGHT = "M20.0053 0C7.57457 0 -1.84491 11.2199 0.307412 23.4629L33.3579 211.463C35.0391 221.026 43.3461 228 53.0559 228L539.183 228C550.228 228 559.183 219.046 559.183 208L559.183 20C559.183 8.9543 550.228 0 539.183 0L20.0053 0Z"

// Icon paths (inline SVG, no dependency)
const ICON_PATHS: Record<string, string> = {
  'landmark':     'M3 22h18M6 18V11M10 18V11M14 18V11M18 18V11M12 2L2 7h20L12 2z',
  'badge-check':  'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z',
  'trending-down':'M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6',
  'sprout':       'M7 20s4-6 8-7-1-8-1-8M7 20s-2-5 1-9c2.5-3.3 6-3 6-3M7 20V9',
  'handshake':    'M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 0 0 0-7.65z',
  'file-text':    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2l6 6M16 13H8M16 17H8M10 9H8',
}

function PanelIcon({ name, dark }: { name: string; dark?: boolean }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: dark ? 'rgba(229,160,74,.12)' : 'rgba(148,134,97,.1)',
      marginBottom: 18,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={dark ? 'var(--amber)' : 'var(--dim)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d={ICON_PATHS[name] ?? ''} />
      </svg>
    </div>
  )
}

function ProblemRow({ pair, index }: { pair: ProblemPair; index: number }) {
  return (
    <div
      className={`prob-row rv d${index + 1}`}
      style={{ position: 'relative', minHeight: 228, display: 'flex', alignItems: 'stretch' }}
    >
      {/* LEFT panel — white, actual SVG shape */}
      <svg
        aria-hidden="true"
        viewBox="0 0 560 228"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, top: 0, width: '53%', height: '100%', display: 'block', filter: 'drop-shadow(0 2px 12px rgba(28,24,19,.06))' }}
      >
        <path d={PATH_LEFT} fill="white" />
      </svg>

      {/* RIGHT panel — dark, actual SVG shape */}
      <svg
        aria-hidden="true"
        viewBox="0 0 560 228"
        preserveAspectRatio="none"
        style={{ position: 'absolute', right: 0, top: 0, width: '53%', height: '100%', display: 'block' }}
      >
        <path d={PATH_RIGHT} fill="var(--ink-mid)" />
      </svg>

      {/* Content grid sits above the SVG shapes */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        width: '100%', alignItems: 'center',
      }}>
        {/* Left content */}
        <div style={{ padding: '44px 56px 44px 44px' }}>
          <PanelIcon name={pair.left.icon} />
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10, display: 'block' }}>
            {pair.left.tag}
          </span>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 10, lineHeight: 1.2, color: 'var(--ink)' }}>
            {pair.left.title}
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--dim)' }}>
            {pair.left.desc}
          </p>
        </div>

        {/* Right content */}
        <div style={{ padding: '44px 44px 44px 56px' }}>
          <PanelIcon name={pair.right.icon} dark />
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 10, display: 'block' }}>
            {pair.right.tag}
          </span>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 10, lineHeight: 1.2, color: '#fff' }}>
            {pair.right.title}
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(247,241,232,.5)' }}>
            {pair.right.desc}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Problems() {
  return (
    <section id="about-us" style={{ padding: '96px 0', background: 'var(--snow)' }}>
      <div className="section-w">
        <div className="rv" style={{ marginBottom: 56 }}>
          <SectionLabel>Problems We Addressed</SectionLabel>
          <h2 className="sh2" style={{ marginTop: 16 }}>
            The system was broken.<br />We <span className="et">fixed it.</span>
          </h2>
          <p className="sb" style={{ marginTop: 16, maxWidth: 520 }}>
            MonieMatch was built because real people in the real Nigerian economy needed it.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {PROBLEM_PAIRS.map((pair, i) => (
            <ProblemRow key={i} pair={pair} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .prob-row {
            flex-direction: column;
            min-height: unset !important;
          }
          .prob-row > svg {
            display: none !important;
          }
          .prob-row > div {
            grid-template-columns: 1fr !important;
            background: transparent;
          }
          .prob-row > div > div:first-child {
            background: #fff;
            border-radius: 16px 16px 0 0;
            padding: 36px 28px !important;
          }
          .prob-row > div > div:last-child {
            background: var(--ink-mid);
            border-radius: 0 0 16px 16px;
            padding: 36px 28px !important;
          }
        }
      `}</style>
    </section>
  )
}
