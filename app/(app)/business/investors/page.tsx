'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getInterestedInvestors } from '@/lib/db'
import { fmtNaira, relTime } from '@/lib/utils'
import type { Investor } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon } from '@/components/app/Icon'

export default function BizInvestorsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<Investor[] | null>(null)

  useEffect(() => { getInterestedInvestors().then(setInvestors).catch(() => setInvestors([])) }, [])

  const loading = investors === null
  const all     = investors || []

  return (
    <div className="app-screen scroll" style={{paddingBottom:16}}>
      <div className="pad" style={{paddingTop:14}}>
        <div className="eyebrow">{loading ? '…' : `${all.length} interested`}</div>
        <div className="h1" style={{fontSize:36, marginTop:6}}>Investors</div>
      </div>

      <div className="pad col gap-10" style={{marginTop:18}}>
        {loading
          ? [0,1,2].map(i => <div key={i} style={{height:110, borderRadius:18, background:'var(--linen)'}} />)
          : all.length === 0
            ? (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'60px 24px', gap:16, textAlign:'center'}}>
                <div style={{width:72, height:72, borderRadius:22, background:'var(--forest-tint)',
                  display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <Icon name="wallet" size={30} color="var(--forest)" />
                </div>
                <div>
                  <p style={{fontSize:18, fontFamily:'var(--font-display)', color:'var(--ink)', margin:'0 0 8px'}}>No offers yet</p>
                  <p style={{fontSize:13.5, color:'var(--ink-2)', margin:0, lineHeight:1.55}}>
                    We&apos;re matching you with investors.<br/>Complete your profile to improve visibility.
                  </p>
                </div>
                <button onClick={() => router.push('/business/profile/edit')} className="btn btn-forest" style={{marginTop:8, padding:'12px 24px'}}>
                  Complete profile →
                </button>
              </div>
            )
            : all.map((inv, i) => (
              <div key={inv.id} className="fadein" style={{animationDelay:`${i*80}ms`}}>
                <InvestorOfferCard inv={inv} highlight={i===0}
                  onClick={() => router.push(`/business/investors/${inv.id}`)} />
              </div>
            ))
        }
      </div>

      <div className="pad" style={{marginTop:18}}>
        <div className="card linen" style={{textAlign:'center', padding:'28px 18px'}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', lineHeight:1.2}}>
            More investors see your profile{' '}
            <span style={{fontStyle:'italic', color:'var(--forest)'}}>when it&apos;s complete.</span>
          </div>
          <button onClick={() => router.push('/business/profile/edit')} className="btn btn-forest" style={{marginTop:14}}>
            Polish profile
          </button>
        </div>
      </div>
    </div>
  )
}

function InvestorOfferCard({ inv, highlight, onClick }: { inv:Investor; highlight:boolean; onClick:()=>void }) {
  return (
    <div onClick={onClick} className="card" style={{padding:14, cursor:'pointer',
      borderColor: highlight ? 'var(--forest)' : 'var(--line)', borderWidth: highlight ? 1.5 : 1}}>
      <div className="row between" style={{alignItems:'flex-start'}}>
        <div className="row gap-12">
          <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={42} />
          <div className="col">
            <div className="row gap-6" style={{marginBottom:2}}>
              <div style={{fontSize:14.5, fontWeight:500}}>{inv.name}</div>
              {highlight && <span className="chip clay" style={{padding:'2px 8px', fontSize:10}}>New</span>}
            </div>
            <div style={{fontSize:12, color:'var(--ink-3)'}}>{inv.role} · {inv.city}</div>
          </div>
        </div>
        <div className="col" style={{alignItems:'flex-end'}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)'}}>
            {fmtNaira(inv.offer?.amount || 0, {compact:true})}
          </div>
          <div style={{fontSize:11, color:'var(--ink-3)'}}>{inv.whenISO ? relTime(inv.whenISO) : ''}</div>
        </div>
      </div>
      <div className="hr" style={{margin:'12px 0'}} />
      <div className="row between" style={{fontSize:12.5}}>
        <div className="row gap-6">
          <Icon name="trend-up" size={14} color="var(--ink-3)" />
          <span>{inv.offer?.terms || inv.returnStructures?.[0] || 'Revenue share'}</span>
        </div>
        <span className="chip" style={{fontSize:11}}>{inv.matchScore}% match</span>
      </div>
    </div>
  )
}
