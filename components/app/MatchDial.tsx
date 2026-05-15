export function MatchDial({ score, size=48, label=true }: {
  score:number; size?:number; label?:boolean
}) {
  const r    = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color = score >= 80 ? 'var(--forest)' : score >= 60 ? 'var(--sun)' : 'var(--clay)'
  return (
    <div style={{position:'relative', width:size, height:size, flexShrink:0}}>
      <svg width={size} height={size} style={{position:'absolute', inset:0, transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line-strong)" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      {label && (
        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:size*0.26, fontWeight:700, color, fontFamily:'var(--font-body)'}}>
          {score}
        </div>
      )}
    </div>
  )
}
