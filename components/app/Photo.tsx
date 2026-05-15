// Placeholder photo with a label/category — replaces real photos when unavailable
export function Photo({ label, height=180, radius=14, color='rgba(180,90,60,0.10)', accent }: {
  label:string; height?:number; radius?:number; color?:string; accent?:React.ReactNode
}) {
  return (
    <div style={{
      height, borderRadius:radius, background:color,
      display:'flex', alignItems:'center', justifyContent:'center',
      position:'relative', overflow:'hidden', flexShrink:0,
    }}>
      <span style={{
        position:'absolute', inset:0,
        backgroundImage:'repeating-linear-gradient(135deg, transparent 0 8px, rgba(31,26,20,0.025) 8px 9px)',
      }} />
      <span style={{
        fontFamily:'var(--font-display)', fontSize:height * 0.12,
        color:'rgba(31,26,20,0.18)', position:'relative', zIndex:1,
      }}>
        {label}
      </span>
      {accent && (
        <div style={{position:'absolute', top:10, right:10, zIndex:2}}>{accent}</div>
      )}
    </div>
  )
}
