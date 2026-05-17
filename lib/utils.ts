// ── Formatting ────────────────────────────────────────────────────────────────

export function fmtNaira(
  value: number,
  opts: { compact?: boolean; decimals?: number } = {}
): string {
  if (opts.compact) {
    if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(opts.decimals ?? 1)}M`
    if (value >= 1_000)     return `₦${(value / 1_000).toFixed(0)}k`
  }
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })
    .format(value)
    .replace('NGN', '₦')
}

export function fmtNairaRange(min: number, max: number): string {
  if (!min && !max) return '—'
  if (min === max)  return fmtNaira(min, { compact: true })
  return `${fmtNaira(min, { compact: true })} – ${fmtNaira(max, { compact: true })}`
}

export function relTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 3)  return `${hours}h ago`
  const d    = new Date(iso)
  const time = d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '')
  const date = d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${time}, ${date}`
}

export function greet(): string {
  const h = new Date().getHours()
  if (h < 5)  return 'Up early'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Colour helpers ────────────────────────────────────────────────────────────

const PALETTE = ['#B45A3C','#2D5D3F','#6B3F4E','#E5A04A','#4A6B6E','#7A4F3D','#3B5998','#8B4513']

export function colorFor(str: string): string {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff
  return PALETTE[h % PALETTE.length]
}

export function initialsFor(name: string): string {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ── Naira range parser ────────────────────────────────────────────────────────

export function parseNairaRange(str: string): { min: number; max: number } {
  if (!str) return { min: 0, max: 0 }
  const parts = str.split(/[–-]/).map(s => s.trim())
  const parse = (s: string) => {
    if (!s) return 0
    const m = s.replace(/[₦,\s]/g, '').match(/([\d.]+)([kKmM]?)/)
    if (!m) return 0
    const n   = parseFloat(m[1])
    const mul = /[kK]/.test(m[2]) ? 1000 : /[mM]/.test(m[2]) ? 1_000_000 : 1
    return Math.round(n * mul)
  }
  return { min: parse(parts[0]), max: parse(parts[1] || parts[0]) }
}
