'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getInvestorById } from '@/lib/db'
import type { Investor } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function BizInvestorDetailPage() {
  const router       = useRouter()
  const params       = useParams()
  const searchParams = useSearchParams()
  const invId        = params.id as string
  const matchId      = searchParams.get('matchId')

  const [inv,     setInv]     = useState<Investor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!invId) { setLoading(false); return }
    getInvestorById(invId).then(data => { setInv(data); setLoading(false) })
  }, [invId])

  if (loading) return (
    <div className="app-screen" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{fontSize:14, color:'var(--ink-3)'}}>Loading…</div>
    </div>
  )
  if (!inv) return (
    <div className="app-screen" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{textAlign:'center', padding:32}}>
        <p style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--ink)', marginBottom:8}}>Investor not found</p>
        <button onClick={() => router.back()} className="btn btn-soft" style={{padding:'10px 20px'}}>Go back</button>
      </div>
    </div>
  )

  return (
    <div className="app-screen">
      <div className="statusbar-spacer" />
      <AppHeader title="Investor profile"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>} />
      <div className="scroll" style={{paddingBottom:100}}>

        {/* Identity */}
        <div className="pad" style={{paddingTop:6, display:'flex', flexDirection:'column', alignItems:'center'}}>
          <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={88} />
          <div className="h1" style={{fontSize:28, marginTop:14}}>{inv.name}</div>
          <div style={{fontSize:13, color:'var(--ink-3)'}}>{inv.role}</div>
          <div className="row gap-6" style={{justifyContent:'center', marginTop:10, flexWrap:'wrap'}}>
            {inv.isVerified && <span className="chip forest"><Icon name="check" size={11} /> BVN verified</span>}
            {inv.city && <span className="chip outline">{inv.city}</span>}
          </div>
        </div>

        {/* Investment preferences */}
        <div className="pad" style={{marginTop:22}}>
          <div className="eyebrow" style={{marginBottom:8}}>Investment preferences</div>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <PrefRow icon="money"    label="Investment range"   value={inv.investmentRange || '—'} />
            <PrefRow icon="trend-up" label="Return structures"  value={(inv.returnStructures||[]).join(', ') || '—'} />
            <PrefRow icon="bell"     label="Reporting cadence"  value={(inv.reportingCadence||[]).join(' or ') || '—'} last />
          </div>
        </div>

        {/* Industries */}
        {(inv.interests||[]).length > 0 && (
          <div className="pad" style={{marginTop:14}}>
            <div className="eyebrow" style={{marginBottom:8}}>What they back</div>
            <div className="row gap-6" style={{flexWrap:'wrap'}}>
              {inv.interests.map(t => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
        )}

        {/* How to proceed */}
        <div className="pad" style={{marginTop:18}}>
          <div className="eyebrow" style={{marginBottom:10}}>To proceed</div>
          <div className="col gap-10">
            <StepItem n="1" title="Start a conversation"
              body="Use the chat to introduce yourself and your business. Ask questions, share documents, and build trust before any money moves." />
            <StepItem n="2" title="Make an offer in chat"
              body="Ready to move forward? Use the Make Offer option inside the conversation to propose investment terms to this investor." />
            <StepItem n="3" title="Complete the deal"
              body="Both parties review the deal summary, sign digitally, and funds are released from escrow straight to your business wallet." />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'14px 16px 22px',
        background:'linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)'}}>
        <button className="btn btn-forest btn-block"
          onClick={() => router.push(matchId ? `/business/chat/${matchId}` : '/business/chat')}>
          Start conversation
        </button>
      </div>
    </div>
  )
}

function PrefRow({ icon, label, value, last }: { icon:string; label:string; value:string; last?:boolean }) {
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
      <div style={{width:28, height:28, borderRadius:999, background:'var(--forest)', color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-display)', fontSize:14, flexShrink:0}}>{n}</div>
      <div>
        <div style={{fontSize:14.5, color:'var(--ink)', fontWeight:500}}>{title}</div>
        <div style={{fontSize:13, color:'var(--ink-2)', marginTop:2, lineHeight:1.5}}>{body}</div>
      </div>
    </div>
  )
}
