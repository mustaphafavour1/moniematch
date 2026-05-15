'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile, getMyMatches } from '@/lib/db'
import { fmtNaira, fmtNairaRange, greet } from '@/lib/utils'
import type { UserProfile, Business } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { MatchDial } from '@/components/app/MatchDial'
import { Photo } from '@/components/app/Photo'

export default function InvHomePage() {
  const router = useRouter()
  const [user,    setUser]    = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<Business[] | null>(null)

  useEffect(() => {
    getMyProfile().then(p => {
      if (!p) { router.replace('/signin'); return }
      if (!p.name) { router.replace('/investor/onboarding'); return }
      setUser(p)
    })
    getMyMatches().then(setMatches)
  }, [router])

  const todayMatches = (matches || []).slice(0, 2)
  const newThisWeek  = (matches || []).slice(2, 5)
  const name         = user?.name || 'Investor'
  const loading      = matches === null

  return (
    <div className="app-screen scroll" style={{paddingBottom:16}}>
      {/* Header */}
      <div className="pad" style={{paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div className="row gap-10">
          <Avatar name={name} initials={user?.initials||'?'} color={user?.color||'var(--forest)'} size={36} />
          <div className="col">
            <div style={{fontSize:11.5, color:'var(--ink-3)'}}>{greet()}</div>
            <div style={{fontSize:15, fontWeight:500, color:'var(--ink)'}}>{name.split(' ')[0]}</div>
          </div>
        </div>
        <RoundBtn onClick={() => router.push('/investor/profile')}>
          <Icon name="bell" size={18} />
        </RoundBtn>
      </div>

      {/* Hero */}
      <div className="pad fadein" style={{marginTop:18}}>
        <div className="eyebrow" style={{marginBottom:10, fontSize:9}}>
          Today · {loading ? '…' : `${todayMatches.length} new ${todayMatches.length===1?'match':'matches'}`}
        </div>
        <div className="h1" style={{fontSize:28}}>
          {loading ? <span style={{color:'var(--ink-3)'}}>Loading matches…</span>
          : todayMatches.length > 0
            ? <>{todayMatches.length===1?'One business is':`${todayMatches.length} businesses are`} looking for the kind of capital{' '}
                <span style={{fontStyle:'italic', color:'var(--clay)', fontSize:27}}>you bring.</span></>
            : <>Your matches are<br/><span style={{fontStyle:'italic', color:'var(--clay)'}}>being calculated.</span></>
          }
        </div>
      </div>

      {/* Match carousel */}
      <div className="fadein d1" style={{marginTop:18, paddingLeft:22, overflowX:'auto', scrollbarWidth:'none'}}>
        <div style={{display:'flex', gap:12, paddingRight:22}}>
          {loading
            ? [0,1].map(i => <div key={i} style={{width:260, height:240, borderRadius:24, background:'var(--linen)', flexShrink:0}} />)
            : todayMatches.length > 0
              ? todayMatches.map((b, i) => (
                  <MatchHeroCard key={b.id} biz={b} index={i} onClick={() => router.push(`/investor/matches/${b.id}`)} />
                ))
              : <div style={{padding:'32px 20px', color:'var(--ink-3)', fontSize:14}}>
                  No matches yet — complete your profile to unlock them.
                </div>
          }
        </div>
      </div>

      {/* Portfolio strip */}
      <div className="pad fadein d2" style={{marginTop:22}}>
        <div className="card ink" onClick={() => router.push('/investor/portfolio')} style={{cursor:'pointer'}}>
          <div className="row between" style={{marginBottom:12}}>
            <div className="eyebrow" style={{color:'rgba(255,252,245,0.55)'}}>Your portfolio</div>
            <div className="row gap-4" style={{color:'rgba(255,252,245,0.6)'}}>
              <span style={{fontSize:12}}>View</span>
              <Icon name="fwd" size={14} color="rgba(255,252,245,0.6)" />
            </div>
          </div>
          <div className="row between" style={{alignItems:'flex-end'}}>
            <div>
              <div style={{fontSize:11, color:'rgba(255,252,245,0.55)', letterSpacing:0.04}}>Deployed</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:30, color:'var(--cream)', lineHeight:1.05}}>
                ₦0
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11, color:'rgba(255,252,245,0.55)', letterSpacing:0.04}}>Active deals</div>
              <div style={{color:'var(--sun)', fontSize:18, fontWeight:500}}>0</div>
            </div>
          </div>
        </div>
      </div>

      {/* New this week */}
      <div className="pad fadein d4" style={{marginTop:24}}>
        <div className="row between" style={{marginBottom:14}}>
          <div className="eyebrow">New this week</div>
          <div onClick={() => router.push('/investor/matches')} style={{fontSize:12, color:'var(--clay)', fontWeight:500, cursor:'pointer'}}>
            See all
          </div>
        </div>
        <div className="col gap-10">
          {newThisWeek.length > 0
            ? newThisWeek.map(b => (
                <MatchListRow key={b.id} biz={b} onClick={() => router.push(`/investor/matches/${b.id}`)} />
              ))
            : <div style={{fontSize:13.5, color:'var(--ink-3)', padding:'8px 0'}}>More businesses coming soon.</div>
          }
        </div>
      </div>
    </div>
  )
}

function MatchHeroCard({ biz, onClick, index=0 }: { biz:Business; onClick:()=>void; index?:number }) {
  return (
    <div onClick={onClick} className="fadein"
      style={{width:260, flexShrink:0, background:'var(--bone)', borderRadius:24, padding:14,
        boxShadow:'var(--shadow-md)', border:'1px solid var(--line)', cursor:'pointer',
        animationDelay:`${index*80}ms`}}>
      <Photo label={biz.photoLab} height={140} radius={14} color={`${biz.color}15`}
        accent={
          <div style={{background:'var(--bone)', borderRadius:999, padding:'4px 10px',
            fontSize:10.5, fontWeight:500, color:'var(--ink)', boxShadow:'var(--shadow-sm)'}}>
            {biz.matchScore}% match
          </div>
        } />
      <div style={{marginTop:12}}>
        <div className="row gap-6" style={{marginBottom:6}}>
          <span className="chip" style={{background:`${biz.color}18`, color:biz.color}}>{biz.category}</span>
          <span className="chip outline">{biz.city}</span>
        </div>
        <div style={{fontFamily:'var(--font-display)', color:'var(--ink)', lineHeight:1.1, fontSize:20}}>{biz.business}</div>
        <div style={{color:'var(--ink-2)', marginTop:4, lineHeight:1.45, fontSize:11}}>{biz.use}</div>
        <div className="hr" style={{margin:'12px 0'}} />
        <div className="row between">
          <div className="col">
            <div style={{fontSize:10, color:'var(--ink-3)', letterSpacing:0.05, textTransform:'uppercase'}}>Raising</div>
            <div style={{fontSize:14, color:'var(--ink)', fontWeight:500}}>{fmtNairaRange(biz.askMin, biz.askMax)}</div>
          </div>
          <div className="col" style={{alignItems:'flex-end'}}>
            <div style={{fontSize:10, color:'var(--ink-3)', letterSpacing:0.05, textTransform:'uppercase'}}>Offer</div>
            <div style={{fontSize:13, color:'var(--ink)', fontWeight:500}}>{biz.returnHeadline.split(' · ')[0]}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchListRow({ biz, onClick }: { biz:Business; onClick:()=>void }) {
  return (
    <div onClick={onClick} style={{background:'var(--bone)', borderRadius:18, padding:12,
      display:'flex', alignItems:'center', gap:12, border:'1px solid var(--line)', cursor:'pointer'}}>
      <div style={{width:56, height:56, borderRadius:14, background:`${biz.color}20`, color:biz.color,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-display)', fontSize:22, flexShrink:0}}>
        {biz.initials}
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div className="row between">
          <div style={{fontSize:14, color:'var(--ink)', fontWeight:500}}>{biz.business}</div>
          <div style={{fontSize:11, color:'var(--clay)', fontWeight:500}}>{biz.matchScore}%</div>
        </div>
        <div style={{fontSize:12, color:'var(--ink-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          {biz.category} · {biz.city} · {biz.returnHeadline.split(' · ')[0]}
        </div>
      </div>
      <Icon name="fwd" size={14} color="var(--ink-3)" />
    </div>
  )
}
