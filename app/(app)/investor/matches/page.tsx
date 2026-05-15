'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyMatches } from '@/lib/db'
import { fmtNaira } from '@/lib/utils'
import type { Business } from '@/lib/types'
import { Icon } from '@/components/app/Icon'
import { MatchDial } from '@/components/app/MatchDial'
import { Progress } from '@/components/app/Progress'

export default function InvMatchesPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Business[] | null>(null)
  const [filter,  setFilter]  = useState('all')
  const [query,   setQuery]   = useState('')

  useEffect(() => { getMyMatches().then(setMatches) }, [])

  const all     = matches || []
  const loading = matches === null
  const cats    = ['all', ...Array.from(new Set(all.map(b => b.category).filter(Boolean))).slice(0,5)]
  const list    = all
    .filter(b => filter === 'all' || b.category === filter)
    .filter(b => !query || b.business.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="app-screen scroll" style={{paddingBottom:16}}>
      <div className="pad" style={{paddingTop:14}}>
        <div className="eyebrow">Matched to your preferences</div>
        <div className="h1" style={{fontSize:36, marginTop:8}}>Matches</div>
        <p style={{color:'var(--ink-2)', fontSize:14, lineHeight:1.5, margin:'8px 0 0'}}>
          {loading ? 'Loading…' : `${all.length} ${all.length===1?'business matches':'businesses match'} your range, return type and cadence.`}
        </p>
      </div>

      {/* Search */}
      <div className="pad" style={{marginTop:18}}>
        <div className="row gap-10" style={{background:'var(--bone)', border:'1px solid var(--line-strong)',
          borderRadius:14, padding:'10px 14px'}}>
          <Icon name="search" size={18} color="var(--ink-3)" />
          <input placeholder="Search by business or owner" value={query} onChange={e => setQuery(e.target.value)}
            style={{flex:1, border:0, background:'transparent', outline:'none', fontFamily:'var(--font-body)',
              fontSize:14, color:'var(--ink)'}} />
          <Icon name="filter" size={18} color="var(--ink-3)" />
        </div>
      </div>

      {/* Filter chips */}
      <div style={{marginTop:14, paddingLeft:22, overflowX:'auto', scrollbarWidth:'none'}}>
        <div style={{display:'flex', gap:6, paddingRight:22}}>
          {cats.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              appearance:'none', border:'1px solid',
              borderColor: filter===cat ? 'var(--ink)' : 'var(--line-strong)',
              background:  filter===cat ? 'var(--ink)' : 'transparent',
              color:       filter===cat ? 'var(--cream)' : 'var(--ink-2)',
              padding:'8px 14px', borderRadius:999,
              fontSize:12.5, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap',
              transition:'all 200ms', fontFamily:'var(--font-body)',
            }}>{cat === 'all' ? 'All' : cat}</button>
          ))}
        </div>
      </div>

      <div className="pad col gap-10" style={{marginTop:18}}>
        {loading
          ? [0,1,2].map(i => <div key={i} style={{height:120, borderRadius:18, background:'var(--linen)'}} />)
          : list.length > 0
            ? list.map((b, i) => (
                <div key={b.id} className="fadein" style={{animationDelay:`${i*50}ms`}}>
                  <BizListCard biz={b} onClick={() => router.push(`/investor/matches/${b.id}`)} />
                </div>
              ))
            : <div style={{padding:'60px 0', textAlign:'center', color:'var(--ink-3)', fontSize:14}}>
                No matches yet. Update your preferences to find businesses.
              </div>
        }
      </div>
    </div>
  )
}

function BizListCard({ biz, onClick }: { biz:Business; onClick:()=>void }) {
  const pct = biz.target > 0 ? Math.round((biz.raised/biz.target)*100) : 0
  return (
    <div onClick={onClick} className="card" style={{padding:14, cursor:'pointer'}}>
      <div className="row gap-12">
        <div style={{width:64, height:64, borderRadius:14, background:`${biz.color}20`, color:biz.color,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'var(--font-display)', fontSize:24, flexShrink:0}}>
          {biz.initials}
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div className="row between">
            <div style={{fontSize:15, color:'var(--ink)', fontWeight:500}}>{biz.business}</div>
            <MatchDial score={biz.matchScore} size={36} label={false} />
          </div>
          <div style={{fontSize:12, color:'var(--ink-2)'}}>{biz.category} · {biz.city}</div>
          <div className="row gap-6" style={{marginTop:6, flexWrap:'wrap'}}>
            <span className="chip" style={{background:`${biz.color}15`, color:biz.color}}>
              {biz.returnHeadline.split(' · ')[0]}
            </span>
            {biz.returnHeadline.split(' · ')[1] && (
              <span className="chip outline">{biz.returnHeadline.split(' · ')[1]}</span>
            )}
          </div>
        </div>
      </div>
      <div style={{marginTop:12}}>
        <Progress value={pct} color={biz.color} />
        <div className="row between" style={{marginTop:6, fontSize:11.5, color:'var(--ink-3)'}}>
          <span><b style={{color:'var(--ink)'}}>{fmtNaira(biz.raised, {compact:true})}</b> raised</span>
          <span>of {fmtNaira(biz.target, {compact:true})} · {pct}%</span>
        </div>
      </div>
    </div>
  )
}
