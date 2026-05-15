import { TICKER_PHRASES } from '@/lib/constants'

export default function Ticker() {
  // Duplicate for seamless loop
  const items = [...TICKER_PHRASES, ...TICKER_PHRASES]

  return (
    <div className="ticker" aria-hidden="true">
      <div className="t-track">
        {items.map((phrase, i) => (
          <span className="t-item" key={i}>
            {phrase}
            <span className="t-dot" />
          </span>
        ))}
      </div>
    </div>
  )
}
