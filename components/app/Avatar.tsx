export function Avatar({ name, initials, color, size=40 }: {
  name:string; initials:string; color:string; size?:number
}) {
  return (
    <div style={{
      width:size, height:size, borderRadius:999, flexShrink:0,
      background:`${color}22`, color,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--font-display)', fontWeight:600,
      fontSize: size > 50 ? size * 0.34 : size * 0.38,
    }} title={name}>
      {initials}
    </div>
  )
}
