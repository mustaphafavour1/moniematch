import SectionLabel from '@/components/ui/SectionLabel'
import { BUSINESS_CATEGORIES, ALGO_ROWS } from '@/lib/constants'

const CAT_ICONS: Record<string, string> = {
  'scissors':     'M6 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM8.12 8.12 12 12M10.5 5.5l9 9M14 13.88 8.12 19.76',
  'cake':         'M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M2 21h20M12 3C12 3 8 7 8 11h8c0-4-4-8-4-8zM12 3v8',
  'camera':       'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  'shopping-bag': 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  'monitor':      'M20 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 21h8M12 17v4',
}

function CategoryIcon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d={CAT_ICONS[name] ?? CAT_ICONS['monitor']} />
    </svg>
  )
}

const ALGO_ICONS: Record<string, string> = {
  'banknote':    'M2 8h20M2 16h20M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  'bar-chart-2': 'M18 20V10M12 20V4M6 20v-6',
  'tag':         'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  'calendar':    'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  'map-pin':     'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
}

function AlgoIcon({ name }: { name: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d={ALGO_ICONS[name] ?? ''} />
    </svg>
  )
}

export default function ForBusinesses() {
  return (
    <section id="businesses" style={{ padding: '96px 0', background: 'var(--ink-mid)' }}>
      <div className="section-w">
        <div className="sg">
          {/* Copy */}
          <div className="rl">
            <SectionLabel light>For Businesses</SectionLabel>
            <h2 className="sh2" style={{ color: '#fff', marginTop: 16 }}>
              Bring your favourite<br />business into <em className="em">the light.</em>
            </h2>
            <p className="sb" style={{ color: 'rgba(247,241,232,.5)', marginTop: 24 }}>
              Stop borrowing from family with no structure. Stop waiting on banks that were never built
              for you. List your business and let the right investor find you.
            </p>

            <div className="bcats">
              {BUSINESS_CATEGORIES.map((cat) => (
                <div key={cat.label} className="bcat">
                  <CategoryIcon name={cat.icon} />
                  {cat.label}
                </div>
              ))}
            </div>

            <a href="/business/onboarding" className="btn-amber" style={{ marginTop: 32, display: 'inline-flex' }}>
              List My Business →
            </a>

          </div>

          {/* Algorithm card */}
          <div className="rr">
            <div className="algo-card">
              <p className="algo-lbl">How Your Match Score Is Built</p>
              {ALGO_ROWS.map((row, i) => (
                <div key={i} className="algo-row" style={i === ALGO_ROWS.length - 1 ? { margin: 0 } : undefined}>
                  <span className="algo-name">
                    <AlgoIcon name={row.icon} /> {row.label}
                  </span>
                  <div className="algo-right">
                    <div className="algo-track">
                      <div className="algo-fill" style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="algo-pt">{row.points}</span>
                  </div>
                </div>
              ))}
              <div className="algo-total">
                <span className="algo-total-lbl">Max Score</span>
                <span className="algo-total-num">99 <span style={{ fontSize: 14, opacity: .4 }}>/99</span></span>
              </div>
              <p className="algo-foot">100 doesn&apos;t exist in real life — but 99 is close enough to change yours.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
