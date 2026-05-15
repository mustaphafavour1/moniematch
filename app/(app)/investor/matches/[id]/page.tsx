'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getBusinessById } from '@/lib/db'
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
  const searchParams = useSearchParams()
  const bizId        = params.id as string
  const isDeal       = searchParams.get('mode') === 'deal'

  const [biz,     setBiz]     = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bizId) { setLoading(false); return }
    getBusinessById(bizId).then(data => { setBiz(data); setLoading(false) })
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

  if (isDeal) return <DealFlow biz={biz} onBack={() => router.back()} onComplete={() => router.replace('/investor/portfolio')} />

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
          <div className="eyebrow" style={{marginBottom:10}}>If you proceed</div>
          <div className="col gap-10">
            <StepItem n="1" title="Review the Deal Summary" body="Plain-English terms, signed by both sides. No money moves yet." />
            <StepItem n="2" title="Fund into escrow" body="Held by a licensed partner. Released only when both sides confirm." />
            <StepItem n="3" title="Get monthly reports + payouts" body={`${(biz.cadence||['Monthly'])[0]} updates and revenue-share payouts to your wallet.`} />
          </div>
        </div>
      </div>

      {/* Fixed CTA */}
      <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'14px 16px 22px',
        background:'linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)',
        display:'flex', flexDirection:'column', gap:8}}>
        <button className="btn btn-primary btn-block"
          onClick={() => router.push(`/investor/matches/${bizId}?mode=deal`)}
          style={{background:'var(--ink)', color:'var(--cream)'}}>
          Start a deal · {fmtNairaRange(biz.askMin, biz.askMax)}
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

// ── Deal flow (embedded, triggered by ?mode=deal) ────────────────────────────

function DealFlow({ biz, onBack, onComplete }: { biz:Business; onBack:()=>void; onComplete:()=>void }) {
  const [stage,    setStage]    = useState(0)
  const [amount,   setAmount]   = useState(biz.askMin || 500_000)
  const [sigDrawn, setSigDrawn] = useState(false)

  useEffect(() => {
    if (stage === 3) { const t = setTimeout(() => setStage(4), 2400); return () => clearTimeout(t) }
  }, [stage])

  return (
    <div className="app-screen">
      <AppHeader
        title={stage === 4 ? 'Deal funded' : 'Deal Summary'}
        leading={
          stage > 0 && stage < 3
            ? <RoundBtn onClick={() => setStage(stage-1)}><Icon name="back" size={18} /></RoundBtn>
            : stage === 0
              ? <RoundBtn onClick={onBack}><Icon name="close" size={18} /></RoundBtn>
              : undefined
        }
      />

      {stage === 0 && (
        <div className="scroll fadein" style={{flex:1, paddingBottom:100}}>
          <div className="pad">
            <div className="eyebrow">Plain-English alignment · not yet binding</div>
            <div className="h1" style={{fontSize:30, marginTop:8}}>
              You and {biz.business.split(' ')[0]}<br/>
              <span style={{fontStyle:'italic', color:'var(--clay)'}}>are aligned on the basics.</span>
            </div>
          </div>
          <div className="pad" style={{marginTop:16}}>
            <div className="card">
              <div className="row between" style={{marginBottom:14}}>
                <div style={{fontSize:14, fontWeight:500, color:'var(--ink)'}}>{biz.business}</div>
                {biz.isVerified && <span className="chip forest"><Icon name="check" size={11}/> Verified</span>}
              </div>
              <div className="hr" />
              <div style={{marginTop:12}}>
                <TermLine label="Investment amount" value={fmtNaira(amount)} editable onClick={() => setStage(1)} />
                <TermLine label="Return structure"  value={biz.returnHeadline} />
                <TermLine label="Reporting cadence" value={`${(biz.cadence||['Monthly'])[0]} updates`} />
                <TermLine label="Payout to"         value="MonieMatch wallet" />
                <TermLine label="Default protection" value="48-hr hardship notice" multiline last />
              </div>
            </div>
          </div>
          <div className="pad" style={{marginTop:14}}>
            <div className="card sand">
              <div className="row gap-10" style={{alignItems:'flex-start'}}>
                <Icon name="shield" size={20} color="var(--forest)" />
                <div>
                  <div style={{fontSize:14, fontWeight:500, color:'var(--ink)'}}>What signing means</div>
                  <p style={{margin:'4px 0 0', fontSize:13, lineHeight:1.5, color:'var(--ink-2)'}}>
                    You agree to fund this deal at the agreed terms. Money moves into escrow first — released only once both signatures are in.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'14px 16px 22px',
            background:'linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)'}}>
            <button className="btn btn-primary btn-block" onClick={() => setStage(1)}>
              Review amount →
            </button>
          </div>
        </div>
      )}

      {stage === 1 && (
        <div className="scroll fadein" style={{flex:1, padding:'0 22px 100px'}}>
          <div className="eyebrow" style={{marginTop:8}}>Investment amount</div>
          <div className="h1" style={{fontSize:28, marginTop:6}}>How much will you put in?</div>
          <div style={{background:'var(--bone)', borderRadius:24, padding:'30px 22px',
            border:'1px solid var(--line)', marginTop:20}}>
            <div style={{textAlign:'center', fontFamily:'var(--font-display)', fontSize:44, color:'var(--ink)', lineHeight:1}}>
              {fmtNaira(amount)}
            </div>
            <div style={{textAlign:'center', marginTop:8, fontSize:12, color:'var(--ink-3)'}}>
              ≈ {biz.target > 0 ? ((amount/biz.target)*100).toFixed(0) : 0}% of {biz.business}&apos;s raise
            </div>
            <input type="range" min={biz.askMin||50000} max={biz.askMax||2000000} step={50000} value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              style={{width:'100%', marginTop:22, accentColor:'var(--clay)'}} />
            <div className="row between" style={{fontSize:11, color:'var(--ink-3)', marginTop:4}}>
              <span>{fmtNaira(biz.askMin, {compact:true})}</span>
              <span>{fmtNaira(biz.askMax, {compact:true})}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-block" style={{marginTop:22}} onClick={() => setStage(2)}>
            Confirm amount
          </button>
        </div>
      )}

      {stage === 2 && (
        <div className="scroll fadein" style={{flex:1, padding:'0 22px 100px'}}>
          <div className="eyebrow" style={{marginTop:8}}>Final step before escrow</div>
          <div className="h1" style={{fontSize:28, marginTop:6}}>Sign the Deal Summary</div>
          <p style={{color:'var(--ink-2)', fontSize:14, lineHeight:1.5, margin:'8px 0 16px'}}>
            Sign with your finger. The owner countersigns before any money moves.
          </p>
          <SignaturePad onChange={setSigDrawn} />
          <button className="btn btn-primary btn-block" style={{marginTop:22, opacity:sigDrawn?1:0.45}}
            disabled={!sigDrawn} onClick={() => setStage(3)}>
            Sign and fund {fmtNaira(amount, {compact:true})} into escrow
          </button>
          <div style={{textAlign:'center', marginTop:10, fontSize:11.5, color:'var(--ink-3)'}}>
            Funds held by Paystack Trust · released on counter-sign
          </div>
        </div>
      )}

      {stage === 3 && (
        <div className="fadein" style={{flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', padding:32}}>
          <div style={{fontSize:20, fontFamily:'var(--font-display)', color:'var(--ink)', marginTop:32, textAlign:'center'}}>
            Moving to escrow…
          </div>
          <p style={{color:'var(--ink-2)', fontSize:14, textAlign:'center', lineHeight:1.5, marginTop:8}}>
            We&apos;re securing {fmtNaira(amount, {compact:true})} with our escrow partner.
          </p>
        </div>
      )}

      {stage === 4 && (
        <div className="fadein" style={{flex:1, display:'flex', flexDirection:'column', padding:'20px 22px'}}>
          <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
            <div style={{width:88, height:88, borderRadius:999, background:'var(--forest-tint)', color:'var(--forest)',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'pulse-soft 1.6s ease-in-out infinite'}}>
              <Icon name="check" size={44} color="var(--forest)" />
            </div>
            <div className="h1" style={{fontSize:30, marginTop:24}}>
              Funded.<br/><span style={{fontStyle:'italic', color:'var(--clay)'}}>Welcome to the deal.</span>
            </div>
            <p style={{color:'var(--ink-2)', fontSize:14, lineHeight:1.5, marginTop:10, maxWidth:280}}>
              {fmtNaira(amount, {compact:true})} is in escrow. {biz.business.split(' ')[0]} has been notified — you&apos;ll see the counter-sign within 24 hours.
            </p>
          </div>
          <button className="btn btn-primary btn-block" onClick={onComplete}>Back to portfolio</button>
        </div>
      )}
    </div>
  )
}

function TermLine({ label, value, editable, multiline, last, onClick }: {
  label:string; value:string; editable?:boolean; multiline?:boolean; last?:boolean; onClick?:()=>void
}) {
  return (
    <div onClick={onClick} style={{display:'flex', justifyContent:'space-between',
      alignItems: multiline ? 'flex-start' : 'center',
      padding:'12px 0', borderBottom: last ? 0 : '1px solid var(--line)',
      cursor: editable ? 'pointer' : 'default'}}>
      <div style={{fontSize:13, color:'var(--ink-2)', flexShrink:0, marginRight:16}}>{label}</div>
      <div style={{fontSize:14, color:'var(--ink)', textAlign:'right', fontWeight:500, lineHeight:1.4}}>
        {value}{editable && <Icon name="fwd" size={12} color="var(--ink-3)" />}
      </div>
    </div>
  )
}

function SignaturePad({ onChange }: { onChange: (drawn:boolean) => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    ctx.lineCap = 'round'; ctx.lineWidth = 2.4; ctx.strokeStyle = '#1F1A14'
    const getPos = (e: PointerEvent) => {
      const r = c.getBoundingClientRect()
      return { x:((e.clientX-r.left)/r.width)*c.width, y:((e.clientY-r.top)/r.height)*c.height }
    }
    const start = (e: PointerEvent) => {
      drawingRef.current = true
      const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y)
    }
    const move = (e: PointerEvent) => {
      if (!drawingRef.current) return; e.preventDefault()
      const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke()
      if (!drawn) { setDrawn(true); onChange(true) }
    }
    const end = () => { drawingRef.current = false }
    c.addEventListener('pointerdown', start)
    c.addEventListener('pointermove', move, { passive:false })
    window.addEventListener('pointerup', end)
    return () => { c.removeEventListener('pointerdown', start); c.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end) }
  }, [drawn, onChange])

  const clear = () => {
    const c = canvasRef.current; if (!c) return
    c.getContext('2d')!.clearRect(0,0,c.width,c.height)
    setDrawn(false); onChange(false)
  }

  return (
    <div style={{background:'var(--bone)', borderRadius:18, padding:12, border:'1px dashed var(--line-strong)'}}>
      <canvas ref={canvasRef} width={640} height={220}
        style={{width:'100%', height:180, borderRadius:10, background:'transparent', touchAction:'none', display:'block'}} />
      <div className="row between" style={{marginTop:6}}>
        <div style={{fontSize:11, color:'var(--ink-3)', fontStyle:'italic'}}>── sign above ──</div>
        <button onClick={clear} className="btn btn-soft" style={{padding:'6px 12px', fontSize:12}}>Clear</button>
      </div>
    </div>
  )
}
