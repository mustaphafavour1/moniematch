export function Progress({ value, color='var(--clay)', height=6 }: {
  value:number; color?:string; height?:number
}) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div style={{width:'100%', height, borderRadius:999, background:'var(--line-strong)', overflow:'hidden'}}>
      <div style={{width:`${pct}%`, height:'100%', background:color, borderRadius:999, transition:'width 600ms ease'}} />
    </div>
  )
}

export function ProgressRing({ value, size=42, stroke=4, color='var(--clay)', children }: {
  value:number; size?:number; stroke?:number; color?:string; children?:React.ReactNode
}) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  return (
    <div style={{position:'relative', width:size, height:size, flexShrink:0}}>
      <svg width={size} height={size} style={{position:'absolute', inset:0, transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line-strong)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{transition:'stroke-dashoffset 600ms ease'}} />
      </svg>
      <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
        {children}
      </div>
    </div>
  )
}
