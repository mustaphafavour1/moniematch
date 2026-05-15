'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile, getInterestedInvestors } from '@/lib/db'
import { fmtNaira, relTime, greet } from '@/lib/utils'
import type { UserProfile, Investor } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { ProgressRing, AnimatedNaira } from '@/components/app/Progress'

export default function BizHomePage() {
  const router = useRouter()
  const [user,       setUser]       = useState<UserProfile | null>(null)
  const [interested, setInterested] = useState<Investor[] | null>(null)

  useEffect(() => {
    getMyProfile().then(p => {
      if (!p) { router.replace('/signin'); return }
      if (!p.name) { router.replace('/business/onboarding'); return }
      setUser(p)
    })
    getInterestedInvestors().then(setInterested)
  }, [router])

  const all      = interested || []
  const newOffers = all.filter(i => !i.status || i.status === 'pending').slice(0, 3)
  const raised   = 0
  const target   = 1_200_000
  const bizName  = user?.bizName || user?.name || 'your business'
  const userName = user?.name || 'Owner'

  return (
    <div className="app-screen scroll" style={{paddingBottom:16}}>
      {/* Header */}
      <div className="pad" style={{paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div className="row gap-10">
          <Avatar name={userName} initials={user?.initials||'?'} color={user?.color||'var(--clay)'} size={36} />
          <div className="col">
            <div style={{fontSize:11.5, color:'var(--ink-3)'}}>{greet()}</div>
            <div style={{fontSize:15, fontWeight:500, color:'var(--ink)'}}>{userName.split(' ')[0]}</div>
          </div>
        </div>
        <RoundBtn onClick={() => router.push('/business/profile')}>
          <Icon name="bell" size={18} />
        </RoundBtn>
      </div>

      {/* Hero */}
      <div className="pad fadein" style={{marginTop:18}}>
        <div className="eyebrow" style={{marginBottom:10}}>
          Today · {all.length} {all.length===1?'investor':'investors'} interested
        </div>
        <div className="h1" style={{fontSize:32}}>
          {newOffers.length > 0
            ? <>{newOffers.length===1?'One investor wants':`${newOffers.length} investors want`} a piece of{' '}
                <span style={{fontStyle:'italic', color:'var(--forest)'}}>{bizName}.</span></>
            : <>Your profile is{' '}
                <span style={{fontStyle:'italic', color:'var(--forest)'}}>live and visible.</span></>
          }
        </div>
      </div>

      {/* Offer cards */}
      {newOffers.length > 0 && (
        <div className="pad fadein d1" style={{marginTop:18}}>
          <div className="col gap-10">
            {newOffers.map((inv, i) => (
              <OfferCard key={inv.id} inv={inv} highlight={i===0}
                onClick={() => router.push(`/business/investors/${inv.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Raise progress */}
      <div className="pad fadein d2" style={{marginTop:22}}>
        <div className="card" style={{background:'var(--forest)', borderColor:'rgba(45,93,63,0.5)', cursor:'pointer'}}
          onClick={() => router.push('/business/profile/edit')}>
          <div className="row between" style={{marginBottom:12}}>
            <div className="eyebrow" style={{color:'rgba(255,255,255,0.6)'}}>Your active raise</div>
            <div className="row gap-4" style={{color:'rgba(255,255,255,0.7)'}}>
              <span style={{fontSize:11}}>View detail</span>
              <Icon name="fwd" size={13} color="rgba(255,255,255,0.7)" />
            </div>
          </div>
          <div className="row between" style={{alignItems:'flex-end'}}>
            <div>
              <div style={{fontSize:11, color:'rgba(255,255,255,0.6)', letterSpacing:0.04}}>Raised</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:30, color:'#fff'}}>
                <AnimatedNaira value={raised} />
              </div>
              <div style={{fontSize:12, color:'rgba(255,255,255,0.7)'}}>of {fmtNaira(target, {compact:true})} target</div>
            </div>
            <ProgressRing value={target > 0 ? (raised/target)*100 : 0} size={56} stroke={5}
              color="var(--sun)" trackColor="rgba(255,255,255,0.15)">
              <span style={{fontFamily:'var(--font-display)', fontSize:16, color:'#fff'}}>
                {target > 0 ? Math.round((raised/target)*100) : 0}%
              </span>
            </ProgressRing>
          </div>
        </div>
      </div>

      {/* Report nudge */}
      <div className="pad fadein d3" style={{marginTop:14}}>
        <div onClick={() => router.push('/business/reporting')} className="card sand" style={{cursor:'pointer'}}>
          <div className="row between">
            <div className="row gap-12">
              <div style={{width:42, height:42, borderRadius:12, background:'var(--clay)', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Icon name="mic" size={20} color="#fff" />
              </div>
              <div className="col">
                <div style={{fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:0.04}}>Monthly report</div>
                <div style={{fontSize:15, color:'var(--ink)', fontWeight:500}}>Speak it. We&apos;ll write it.</div>
              </div>
            </div>
            <Icon name="fwd" size={16} color="var(--ink-3)" />
          </div>
        </div>
      </div>

      {/* Profile completeness */}
      <div className="pad fadein d4" style={{marginTop:22}}>
        <div className="card">
          <div className="row gap-14">
            <ProgressRing value={78} size={56} stroke={5} color="var(--forest)">
              <span style={{fontFamily:'var(--font-display)', fontSize:16, color:'var(--ink)'}}>78%</span>
            </ProgressRing>
            <div style={{flex:1}}>
              <div style={{fontSize:14, fontWeight:500}}>3 things left to complete</div>
              <div style={{fontSize:12.5, color:'var(--ink-3)', marginTop:4}}>POS link · 2 photos · founder story</div>
            </div>
          </div>
          <div className="hr" style={{margin:'14px 0'}} />
          <div className="col gap-10">
            <ProfileTask label="Connect Moniepoint POS" subtitle="Pulls last 90 days automatically" badge="+12% match" />
            <ProfileTask label="Add 2 shop photos" subtitle="Investors stay 3× longer with photos" />
            <ProfileTask label="Record your founder story" subtitle="60-second voice note. We&apos;ll transcribe." />
          </div>
        </div>
      </div>
    </div>
  )
}

function OfferCard({ inv, highlight, onClick }: { inv:Investor; highlight:boolean; onClick:()=>void }) {
  return (
    <div onClick={onClick} className="card" style={{padding:14, cursor:'pointer',
      borderColor: highlight ? 'var(--forest)' : 'var(--line)',
      borderWidth: highlight ? 1.5 : 1}}>
      <div className="row between" style={{alignItems:'flex-start'}}>
        <div className="row gap-12">
          <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={42} />
          <div className="col">
            <div className="row gap-6" style={{marginBottom:2}}>
              <div style={{fontSize:14.5, fontWeight:500}}>{inv.name}</div>
              <span className="chip clay" style={{padding:'2px 8px', fontSize:10}}>New</span>
            </div>
            <div style={{fontSize:12, color:'var(--ink-3)'}}>{inv.role}</div>
          </div>
        </div>
        <div className="col" style={{alignItems:'flex-end'}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)'}}>
            {fmtNaira(inv.offer?.amount || 0, {compact:true})}
          </div>
          <div style={{fontSize:11, color:'var(--ink-3)'}}>{inv.whenISO ? relTime(inv.whenISO) : 'New'}</div>
        </div>
      </div>
      <div className="hr" style={{margin:'12px 0'}} />
      <div className="row between" style={{fontSize:12.5}}>
        <div className="row gap-6">
          <Icon name="trend-up" size={14} color="var(--ink-3)" />
          <span>{inv.offer?.terms || inv.returnStructures?.[0] || 'Revenue share'}</span>
        </div>
        <span style={{fontSize:11, color:'var(--ink-3)'}}>{inv.investmentRange}</span>
      </div>
    </div>
  )
}

function ProfileTask({ label, subtitle, badge }: { label:string; subtitle:string; badge?:string }) {
  return (
    <div className="row gap-12" style={{alignItems:'center'}}>
      <div style={{width:24, height:24, borderRadius:999, border:'1.5px solid var(--line-strong)', flexShrink:0}} />
      <div style={{flex:1, minWidth:0}}>
        <div className="row between">
          <div style={{fontSize:13.5, fontWeight:500}}>{label}</div>
          {badge && <span className="chip forest" style={{padding:'2px 8px', fontSize:10}}>{badge}</span>}
        </div>
        <div style={{fontSize:12, color:'var(--ink-3)', marginTop:2}}>{subtitle}</div>
      </div>
    </div>
  )
}
