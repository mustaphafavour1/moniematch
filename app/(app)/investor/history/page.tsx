'use client'
import { useRouter } from 'next/navigation'
import { fmtNaira } from '@/lib/utils'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { Progress } from '@/components/app/Progress'
import { Avatar } from '@/components/app/Avatar'

// Mock data — will be replaced by real DB call in a future iteration
const MOCK_DEALS = [
  { id:1, biz:'Layi Bakehouse', category:'Bakery', amount:500_000, status:'active', returnType:'Revenue share', started:'Mar 2026', progress:68, initials:'LB', color:'#B45A3C' },
  { id:2, biz:'Zara\'s Fashion',  category:'Fashion', amount:800_000, status:'completed', returnType:'Fixed return', started:'Jan 2026', progress:100, initials:'ZF', color:'#2D5D3F' },
  { id:3, biz:'Mama\'s Kitchen',  category:'Food',    amount:300_000, status:'active', returnType:'Revenue share', started:'Feb 2026', progress:40, initials:'MK', color:'#E5A04A' },
]
const STATUS_CFG: Record<string,{label:string;color:string;bg:string}> = {
  active:    { label:'Active',    color:'var(--forest)', bg:'var(--forest-tint)' },
  completed: { label:'Completed', color:'var(--ink-3)',  bg:'rgba(31,26,20,0.06)' },
  defaulted: { label:'Defaulted', color:'var(--clay)',   bg:'var(--clay-tint)' },
}

export default function InvHistoryPage() {
  const router = useRouter()
  const total = MOCK_DEALS.reduce((s,d) => s+d.amount, 0)

  return (
    <div className="app-screen" style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <AppHeader title="Deal history"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18}/></RoundBtn>} sticky />
      <div className="scroll" style={{flex:1}}>
        <div className="pad" style={{paddingTop:8}}>
          {/* Summary banner */}
          <div style={{background:'linear-gradient(135deg, var(--clay) 0%, #A04527 100%)',
            borderRadius:18, padding:'18px 18px', marginBottom:20, color:'#fff'}}>
            <p style={{fontSize:11.5, opacity:0.75, margin:'0 0 4px', letterSpacing:0.6, textTransform:'uppercase', fontWeight:600}}>Total invested</p>
            <p style={{fontSize:28, fontFamily:'var(--font-display)', margin:'0 0 14px'}}>{fmtNaira(total)}</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
              {[
                {label:'Deals',     val: MOCK_DEALS.length},
                {label:'Active',    val: MOCK_DEALS.filter(d=>d.status==='active').length},
                {label:'Completed', val: MOCK_DEALS.filter(d=>d.status==='completed').length},
              ].map(({label,val}) => (
                <div key={label} style={{background:'rgba(255,255,255,0.14)', borderRadius:10, padding:'9px 10px', textAlign:'center'}}>
                  <p style={{fontSize:18, fontFamily:'var(--font-display)', margin:'0 0 2px'}}>{val}</p>
                  <p style={{fontSize:10.5, opacity:0.75, margin:0, fontWeight:500}}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="eyebrow">All deals</div>
          <div className="col gap-10" style={{marginTop:12}}>
            {MOCK_DEALS.map(d => {
              const sc = STATUS_CFG[d.status]
              return (
                <div key={d.id} className="card" style={{padding:'14px 16px'}}>
                  <div className="row gap-12" style={{marginBottom:12}}>
                    <Avatar name={d.biz} initials={d.initials} color={d.color} size={44} />
                    <div style={{flex:1}}>
                      <p style={{fontSize:14, fontWeight:600, color:'var(--ink)', margin:'0 0 2px'}}>{d.biz}</p>
                      <p style={{fontSize:12, color:'var(--ink-3)', margin:0}}>{d.category} · {d.started}</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <p style={{fontSize:15, fontWeight:600, fontFamily:'var(--font-display)', color:'var(--ink)', margin:'0 0 4px'}}>
                        {fmtNaira(d.amount, {compact:true})}
                      </p>
                      <div style={{background:sc.bg, color:sc.color, fontSize:10.5, fontWeight:600,
                        padding:'3px 8px', borderRadius:999, display:'inline-block'}}>
                        {sc.label}
                      </div>
                    </div>
                  </div>
                  <div className="row between" style={{marginBottom:5}}>
                    <span style={{fontSize:11.5, color:'var(--ink-3)'}}>{d.returnType}</span>
                    <span style={{fontSize:11.5, color:'var(--ink-3)'}}>{d.progress}% returned</span>
                  </div>
                  <Progress value={d.progress} color={d.status==='completed' ? 'var(--forest)' : 'var(--clay)'} height={5} />
                </div>
              )
            })}
          </div>
          <div style={{height:32}} />
        </div>
      </div>
    </div>
  )
}
