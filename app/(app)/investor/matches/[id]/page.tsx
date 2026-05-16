'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getBusinessById, getOrCreateMatchForBusiness } from '@/lib/db'
import { fmtNaira, fmtNairaRange } from '@/lib/utils'
import type { Business } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { MatchDial } from '@/components/app/MatchDial'
import { Progress } from '@/components/app/Progress'
import { AppHeader } from '@/components/app/AppHeader'
import { Photo } from '@/components/app/Photo'

export default function BusinessDetailPage() {
  const router       = useRouter()
  const params       = useParams()
  const bizId        = params.id as string

  const [biz,     setBiz]     = useState<Business | null>(null)
  const [matchId, setMatchId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bizId) { setLoading(false); return }
    Promise.all([getBusinessById(bizId), getOrCreateMatchForBusiness(bizId)]).then(([data, mid]) => {
      setBiz(data)
      setMatchId(mid)
      setLoading(false)
    })
  }, [bizId])

  if (loading) return (
    <div className="app-screen" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{fontSize:14, color:'var(--ink-3)'}}>Loading…</div>
    </div>
  )
  if (!biz) return (
    <div className="app-screen" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center', padding:32}}>
        <p style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--ink)', marginBottom:8}}>Business not found</p>
        <button onClick={() => router.back()} className="btn btn-soft" style={{padding:'10px 20px'}}>Go back</button>
      </div>
    </div>
  )

  const pct = biz.target > 0 ? Math.round((biz.raised/biz.target)*100) : 0

  return (
    <div className="app-screen">
      <div className="scroll" style={{paddingBottom:100}}>
        {/* Hero photo */}
        <div style={{position:'relative'}}>
          <Photo label={biz.photoLab} height={260} radius={0} color={`${biz.color}25`} />
          <div style={{position:'absolute', top:12, left:16, right:16, display:'flex', justifyContent:'space-between'}}>
            <RoundBtn onClick={() => router.back()} bg="rgba(255,252,245,0.95)" size={40}><Icon name="back" size={18} /></RoundBtn>
          </div>
          <div style={{position:'absolute', bottom:-28, right:22, background:'var(--bone)', borderRadius:999,
            padding:8, boxShadow:'var(--shadow-md)'}}>
            <MatchDial score={biz.matchScore} size={56} />
          </div>
        </div>

        {/* Identity */}
        <div className="pad" style={{marginTop:24}}>
          <div className="row gap-6" style={{marginBottom:8, flexWrap:'wrap'}}>
            <span className="chip" style={{background:`${biz.color}15`, color:biz.color}}>{biz.category}</span>
            <span className="chip outline">{biz.city}</span>
            {biz.isVerified && <span className="chip forest"><Icon name="check" size={11} /> Verified</span>}
          </div>
          <div className="h1" style={{fontSize:32}}>{biz.business}</div>
          {biz.ownerName && (
            <div className="row gap-8" style={{marginTop:8, color:'var(--ink-2)'}}>
              <Avatar name={biz.ownerName} initials={(biz.ownerName||'?').split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase()} color={biz.color} size={26} />
              <span style={{fontSize:13.5}}>{biz.ownerName} · owner</span>
            </div>
          )}
        </div>

        {/* Pitch */}
        {biz.pitch && (
          <div className="pad" style={{marginTop:18}}>
            <div className="card linen">
              <div className="eyebrow" style={{marginBottom:8}}>The pitch</div>
              <p style={{margin:0, fontSize:15, lineHeight:1.55, color:'var(--ink)'}}>{biz.pitch}</p>
            </div>
          </div>
        )}

        {/* Use of funds */}
        <div className="pad" style={{marginTop:14}}>
          <div className="card">
            <div className="eyebrow" style={{marginBottom:6}}>What the money does</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:22, lineHeight:1.2, color:'var(--ink)'}}>{biz.use}</div>
          </div>
        </div>

        {/* Raise progress */}
        <div className="pad" style={{marginTop:14}}>
          <div className="card sand">
            <div className="row between" style={{marginBottom:10}}>
              <div className="eyebrow">Raise progress</div>
              <span className="chip outline">{pct}%</span>
            </div>
            <div style={{fontFamily:'var(--font-display)', fontSize:26, color:'var(--ink)'}}>
              {fmtNaira(biz.raised, {compact:true})}
              <span style={{color:'var(--ink-3)', fontSize:18}}> / {fmtNaira(biz.target, {compact:true})}</span>
            </div>
            <Progress value={pct} color={biz.color} height={8} />
          </div>
        </div>

        {/* Deal terms */}
        <div className="pad" style={{marginTop:14}}>
          <div className="eyebrow" style={{marginBottom:8}}>Deal terms</div>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <DetailRow icon="money"    label="Investment range"   value={fmtNairaRange(biz.askMin, biz.askMax)} />
            <DetailRow icon="trend-up" label="Return offered"     value={biz.returnHeadline} />
            <DetailRow icon="bell"     label="Reporting cadence"  value={(biz.cadence||['Monthly']).join(' or ')} />
            <DetailRow icon="calendar" label="Duration"           value={biz.duration || 'Open'} last />
          </div>
        </div>

        {/* Steps */}
        <div className="pad" style={{marginTop:18}}>
          <div className="eyebrow" style={{marginBottom:10}}>To proceed</div>
          <div className="col gap-10">
            <StepItem n="1" title="Start a conversation"
              body="Reach out directly in chat. Get the full picture — ask about financials, operations, and growth plans. Request documents if needed." />
            <StepItem n="2" title="Make an offer in chat"
              body="Once you're comfortable, use the Make Offer option inside the conversation to propose your investment amount and terms." />
            <StepItem n="3" title="Complete the deal"
              body="Review the deal summary document together, authorise the escrow payment, and both parties sign to release funds." />
          </div>
        </div>
      </div>

      {/* Fixed CTA */}
      <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'14px 16px 22px',
        background:'linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)',
        display:'flex', flexDirection:'column', gap:8}}>
        <button className="btn btn-primary btn-block"
          onClick={() => router.push(matchId ? `/investor/chat/${matchId}` : '/investor/chat')}
          style={{background:'var(--ink)', color:'var(--cream)'}}>
          Start conversation
        </button>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value, last }: { icon:string; label:string; value:string; last?:boolean }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
      borderBottom: last ? 0 : '1px solid var(--line)'}}>
      <div style={{width:30, height:30, borderRadius:8, background:'var(--linen)', color:'var(--ink-2)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:0.04, textTransform:'uppercase'}}>{label}</div>
        <div style={{fontSize:14, color:'var(--ink)', marginTop:2}}>{value}</div>
      </div>
    </div>
  )
}

function StepItem({ n, title, body }: { n:string; title:string; body:string }) {
  return (
    <div className="row gap-12" style={{alignItems:'flex-start'}}>
      <div style={{width:28, height:28, borderRadius:999, background:'var(--ink)', color:'var(--cream)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-display)', fontSize:14, flexShrink:0}}>{n}</div>
      <div>
        <div style={{fontSize:14.5, color:'var(--ink)', fontWeight:500}}>{title}</div>
        <div style={{fontSize:13, color:'var(--ink-2)', marginTop:2, lineHeight:1.5}}>{body}</div>
      </div>
    </div>
  )
}
