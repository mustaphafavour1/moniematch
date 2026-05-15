import SectionLabel from '@/components/ui/SectionLabel'
import { PROBLEM_PAIRS } from '@/lib/constants'
import type { ProblemPair } from '@/lib/types'

// Icon map — inline SVG paths for the icons used (avoids importing full lucide on server)
const ICON_PATHS: Record<string, string> = {
  'landmark':    'M3 22h18M6 18V11M10 18V11M14 18V11M18 18V11M12 2L2 7h20L12 2z',
  'badge-check': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1-7l-2-2-1.5 1.5L9 16l2 2 4-4-1.5-1.5L11 15z',
  'trending-down':'M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6',
  'sprout':      'M7 20s4-6 8-7-1-8-1-8M7 20s-2-5 1-9c2.5-3.3 6-3 6-3M7 20V9',
  'handshake':   'M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 0 0 0-7.65z',
  'file-text':   'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2l6 6M16 13H8M16 17H8M10 9H8',
}

function DiagIcon({ name, dark }: { name: string; dark?: boolean }) {
  return (
    <div className={`dp-icon ${dark ? 'dark' : 'light'}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={dark ? 'var(--amber)' : 'var(--dim)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d={ICON_PATHS[name] ?? ''} />
      </svg>
    </div>
  )
}

function PairRow({ pair, index }: { pair: ProblemPair; index: number }) {
  return (
    <div className={`diag-pair rv d${index + 1} ${pair.flip ? 'flip' : ''}`}>
      <div className="dp-left">
        <DiagIcon name={pair.left.icon} />
        <span className="dp-tag">{pair.left.tag}</span>
        <div className="dp-title">{pair.left.title}</div>
        <p className="dp-desc">{pair.left.desc}</p>
      </div>
      <div className="dp-right">
        <DiagIcon name={pair.right.icon} dark />
        <span className="dp-tag">{pair.right.tag}</span>
        <div className="dp-title">{pair.right.title}</div>
        <p className="dp-desc">{pair.right.desc}</p>
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

        <div className="diag-rows">
          {PROBLEM_PAIRS.map((pair, i) => (
            <PairRow key={i} pair={pair} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
