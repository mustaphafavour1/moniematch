'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyPortfolio } from '@/lib/db'
import { fmtNaira } from '@/lib/utils'
import type { Deal } from '@/lib/types'
import { Progress } from '@/components/app/Progress'

export default function InvPortfolioPage() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[] | null>(null)

  useEffect(() => { getMyPortfolio().then(setDeals).catch(() => setDeals([])) }, [])

  const loading = deals === null
  const items   = deals || []
  const total   = items.reduce((s, p) => s + (p.invested || p.amount || 0), 0)
  const paid    = items.reduce((s, p) => s + (p.paidBack || 0), 0)

  return (
    <div className="app-screen scroll" style={{paddingBottom:16}}>
      <div className="pad" style={{paddingTop:14}}>
        <div className="eyebrow">Live deals</div>
        <div className="h1" style={{fontSize:36, marginTop:6}}>Portfolio</div>
      </div>

      <div className="pad" style={{marginTop:18}}>
        <div className="card ink">
          <div className="row between">
            <div>
              <div style={{fontSize:11, color:'rgba(255,252,245,0.6)', textTransform:'uppercase', letterSpacing:0.05}}>Total deployed</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:32, color:'var(--cream)', marginTop:4}}>
                {loading ? '…' : fmtNaira(total)}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11, color:'rgba(255,252,245,0.6)', textTransform:'uppercase', letterSpacing:0.05}}>Paid back</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--sun)', marginTop:4}}>
                {fmtNaira(paid, {compact:true})}
              </div>
            </div>
          </div>
          <div className="hr" style={{background:'rgba(255,252,245,0.1)', margin:'16px 0'}} />
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
            {[
              {label:'Active', value: String(items.filter(d=>d.status==='active').length)},
              {label:'Avg return', value:'—'},
              {label:'Watch', value:'0'},
            ].map(s => (
              <div key={s.label}>
                <div style={{fontSize:10, color:'rgba(255,252,245,0.55)', textTransform:'uppercase', letterSpacing:0.05}}>{s.label}</div>
                <div style={{fontFamily:'var(--font-display)', fontSize:22, marginTop:2, color:'var(--cream)'}}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pad" style={{marginTop:18}}>
        <div className="eyebrow" style={{marginBottom:10}}>Positions</div>
        {loading
          ? [0,1].map(i => <div key={i} style={{height:110, borderRadius:18, background:'var(--linen)', marginBottom:10}} />)
          : items.length === 0
            ? (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'60px 24px', gap:16, textAlign:'center'}}>
                <div style={{width:72, height:72, borderRadius:22, background:'var(--sun-tint)',
                  display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--sun)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                <div>
                  <p style={{fontSize:18, fontFamily:'var(--font-display)', color:'var(--ink)', margin:'0 0 8px'}}>No active investments</p>
                  <p style={{fontSize:13.5, color:'var(--ink-2)', margin:0, lineHeight:1.55}}>Back your first business to start building your portfolio.</p>
                </div>
                <button onClick={() => router.push('/investor/matches')} className="btn btn-primary" style={{marginTop:8, padding:'12px 24px'}}>
                  Explore matches →
                </button>
              </div>
            )
            : (
              <div className="col gap-10">
                {items.map((p, i) => {
                  const biz = p.biz
                  if (!biz) return null
                  const pct = p.monthsTotal ? Math.round(((p.monthsIn||0)/p.monthsTotal)*100) : 0
                  return (
                    <div key={p.dealId || i} className="card fadein" style={{padding:14, cursor:'pointer', animationDelay:`${i*80}ms`}}>
                      <div className="row gap-12">
                        <div style={{width:48, height:48, borderRadius:12, background:`${biz.color}20`, color:biz.color,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontFamily:'var(--font-display)', fontSize:20, flexShrink:0}}>
                          {biz.initials}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                          <div className="row between">
                            <div style={{fontSize:14, color:'var(--ink)', fontWeight:500}}>{biz.business}</div>
                            <span className="chip forest">On track</span>
                          </div>
                          <div style={{fontSize:12, color:'var(--ink-3)'}}>{p.structure}</div>
                        </div>
                      </div>
                      <div className="row between" style={{marginTop:12}}>
                        <div className="col">
                          <div style={{fontSize:10, color:'var(--ink-3)', letterSpacing:0.05, textTransform:'uppercase'}}>Invested</div>
                          <div style={{fontSize:14, fontWeight:500, color:'var(--ink)'}}>{fmtNaira(p.invested||p.amount, {compact:true})}</div>
                        </div>
                        <div className="col">
                          <div style={{fontSize:10, color:'var(--ink-3)', letterSpacing:0.05, textTransform:'uppercase'}}>Paid back</div>
                          <div style={{fontSize:14, fontWeight:500, color:'var(--forest)'}}>{fmtNaira(p.paidBack||0, {compact:true})}</div>
                        </div>
                      </div>
                      <div style={{marginTop:10}}>
                        <Progress value={pct} color={biz.color} height={4} />
                        <div className="row between" style={{fontSize:11, color:'var(--ink-3)', marginTop:4}}>
                          <span>Month {p.monthsIn||0} of {p.monthsTotal||12}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
        }
      </div>
    </div>
  )
}
