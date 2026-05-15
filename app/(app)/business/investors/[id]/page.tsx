'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getInvestorById } from '@/lib/db'
import { fmtNaira, fmtNairaRange } from '@/lib/utils'
import type { Investor } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'
import { AnimatedNaira } from '@/components/app/Progress'

export default function BizInvestorDetailPage() {
  const router       = useRouter()
  const params       = useParams()
  const searchParams = useSearchParams()
  const invId        = params.id as string
  const mode         = searchParams.get('mode') // 'deal' or 'sign'

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

  if (mode === 'sign') return <DealSign inv={inv} onBack={() => router.back()} onComplete={() => router.replace('/business')} />

  // ── Offer detail view ──────────────────────────────────────────────────────
  return (
    <div className="app-screen">
      <div className="statusbar-spacer" />
      <AppHeader title="Offer review"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>} />
      <div className="scroll" style={{paddingBottom:100}}>
        {/* Identity */}
        <div className="pad" style={{paddingTop:6, textAlign:'center'}}>
          <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={88} />
          <div className="h1" style={{fontSize:28, marginTop:14}}>{inv.name}</div>
          <div style={{fontSize:13, color:'var(--ink-3)'}}>{inv.role}</div>
          <div className="row gap-6" style={{justifyContent:'center', marginTop:10, flexWrap:'wrap'}}>
            {inv.isVerified && <span className="chip forest"><Icon name="check" size={11} /> BVN verified</span>}
            <span className="chip outline">{inv.city}</span>
          </div>
        </div>

        {/* Offer card */}
        <div className="pad" style={{marginTop:22}}>
          <div className="card" style={{background:'var(--clay)', borderColor:'rgba(180,90,60,0.5)'}}>
            <div className="eyebrow" style={{color:'rgba(255,255,255,0.7)', marginBottom:8}}>Their offer to you</div>
            <div style={{fontFamily:'var(--font-display)', fontSize:38, color:'#fff', lineHeight:1.05}}>
              {fmtNaira(inv.offer?.amount || 0)}
            </div>
            <div style={{fontSize:14, color:'rgba(255,255,255,0.85)', marginTop:6}}>
              {inv.offer?.terms || inv.returnStructures?.[0] || 'Revenue share'}
            </div>
            <div className="hr" style={{background:'rgba(255,255,255,0.18)', margin:'14px 0'}} />
            <div className="row between" style={{fontSize:12.5, color:'rgba(255,255,255,0.85)'}}>
              <span>Range: {inv.investmentRange}</span>
              <span>{(inv.returnStructures||[]).join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Compatibility */}
        <div className="pad" style={{marginTop:14}}>
          <div className="eyebrow" style={{marginBottom:8}}>Compatibility check</div>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <CompatRow ok label="Amount overlap"     detail={`Their range: ${inv.investmentRange}`} />
            <CompatRow ok label="Return type"        detail={(inv.returnStructures||['Revenue share']).join(', ')} />
            <CompatRow ok label="Reporting cadence"  detail={(inv.reportingCadence||['Monthly']).join(' or ')} last />
          </div>
        </div>

        {/* Interests */}
        {(inv.interests||[]).length > 0 && (
          <div className="pad" style={{marginTop:14}}>
            <div className="eyebrow" style={{marginBottom:8}}>What they back</div>
            <div className="row gap-6" style={{flexWrap:'wrap'}}>
              {inv.interests.map(t => <span key={t} className="chip">{t}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'14px 16px 22px',
        background:'linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)',
        display:'flex', flexDirection:'column', gap:8}}>
        <div className="row gap-8">
          <button className="btn btn-soft" style={{flex:1}} onClick={() => router.back()}>Decline</button>
          <button className="btn btn-forest" style={{flex:1.5}}
            onClick={() => router.push(`/business/investors/${invId}?mode=sign`)}>
            Accept & counter-sign
          </button>
        </div>
      </div>
    </div>
  )
}

function CompatRow({ ok, label, detail, last }: { ok:boolean; label:string; detail:string; last?:boolean }) {
  return (
    <div className="row gap-12" style={{padding:'14px 16px', borderBottom: last ? 0 : '1px solid var(--line)'}}>
      <div style={{width:24, height:24, borderRadius:999, background: ok ? 'var(--forest)' : 'var(--clay)', color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
        <Icon name={ok ? 'check' : 'close'} size={14} color="#fff" strokeWidth={2.4} />
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:14, fontWeight:500}}>{label}</div>
        <div style={{fontSize:12.5, color:'var(--ink-3)', marginTop:2}}>{detail}</div>
      </div>
    </div>
  )
}

// ── Counter-sign deal flow ─────────────────────────────────────────────────────
function DealSign({ inv, onBack, onComplete }: { inv:Investor; onBack:()=>void; onComplete:()=>void }) {
  const [stage, setStage] = useState(0) // 0 review, 1 sign, 2 escrow, 3 received
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    if (stage === 2) { const t = setTimeout(() => setStage(3), 2400); return () => clearTimeout(t) }
  }, [stage])

  return (
    <div className="app-screen">
      <div className="statusbar-spacer" />
      <AppHeader title={stage === 3 ? 'Funded' : 'Counter-sign'}
        leading={stage === 0 ? <RoundBtn onClick={onBack}><Icon name="close" size={18} /></RoundBtn> : undefined} />

      {stage === 0 && (
        <div className="scroll fadein" style={{flex:1, paddingBottom:100}}>
          <div className="pad">
            <div className="eyebrow">Both must sign before money releases</div>
            <div className="h1" style={{fontSize:28, marginTop:8}}>
              {inv.name} signed.<br/>
              <span style={{fontStyle:'italic', color:'var(--forest)'}}>Your turn.</span>
            </div>
          </div>
          <div className="pad" style={{marginTop:14}}>
            <div className="card">
              <div className="row gap-12" style={{marginBottom:14}}>
                <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={36} />
                <div className="col">
                  <div style={{fontSize:14, fontWeight:500}}>{inv.name}</div>
                  <div style={{fontSize:12, color:'var(--ink-3)'}}>Counter-party</div>
                </div>
                <div style={{marginLeft:'auto'}}><span className="chip forest"><Icon name="check" size={11}/> Signed</span></div>
              </div>
              <div className="hr" />
              <div style={{marginTop:12}}>
                <TermLine label="Investment amount"  value={fmtNaira(inv.offer?.amount || 0)} />
                <TermLine label="Return structure"   value={inv.offer?.terms || inv.returnStructures?.[0] || 'Revenue share'} />
                <TermLine label="Reporting cadence"  value={(inv.reportingCadence||['Monthly'])[0]} />
                <TermLine label="Escrow partner"     value="Paystack Trust" last />
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 1 && (
        <div className="scroll fadein" style={{flex:1, padding:'0 22px 100px'}}>
          <div className="eyebrow" style={{marginTop:8}}>Your signature</div>
          <div className="h1" style={{fontSize:26, marginTop:6}}>Sign to release escrow</div>
          <p style={{color:'var(--ink-2)', fontSize:14, lineHeight:1.5, margin:'8px 0 16px'}}>
            {fmtNaira(inv.offer?.amount || 0)} will land in your business wallet within minutes of your sign.
          </p>
          <SignaturePad onChange={setDrawn} />
        </div>
      )}

      {stage === 2 && (
        <div className="fadein" style={{flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', padding:32}}>
          <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', textAlign:'center'}}>
            Releasing funds…
          </div>
        </div>
      )}

      {stage === 3 && (
        <div className="fadein" style={{flex:1, display:'flex', flexDirection:'column', padding:'20px 22px'}}>
          <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
            <div style={{width:88, height:88, borderRadius:999, background:'var(--forest-tint)', color:'var(--forest)',
              display:'flex', alignItems:'center', justifyContent:'center', animation:'pulse-soft 1.6s ease-in-out infinite'}}>
              <Icon name="check" size={44} color="var(--forest)" />
            </div>
            <div className="h1" style={{fontSize:30, marginTop:24}}>
              <AnimatedNaira value={inv.offer?.amount || 0} /><br/>
              <span style={{fontStyle:'italic', color:'var(--forest)'}}>landed.</span>
            </div>
            <p style={{color:'var(--ink-2)', fontSize:14, marginTop:10, maxWidth:280, lineHeight:1.5}}>
              In your MonieMatch business wallet. First report due at end of month.
            </p>
          </div>
          <button className="btn btn-forest btn-block" onClick={onComplete}>Back to home</button>
        </div>
      )}

      {stage < 3 && (
        <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'14px 16px 22px',
          background:'linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)'}}>
          {stage === 0 && (
            <button className="btn btn-forest btn-block" onClick={() => setStage(1)}>
              Continue to signature
            </button>
          )}
          {stage === 1 && (
            <button className="btn btn-forest btn-block" disabled={!drawn} style={{opacity:drawn?1:0.45}}
              onClick={() => setStage(2)}>
              Counter-sign and release {fmtNaira(inv.offer?.amount||0, {compact:true})}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function TermLine({ label, value, multiline, last }: { label:string; value:string; multiline?:boolean; last?:boolean }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:multiline?'flex-start':'center',
      padding:'12px 0', borderBottom:last?0:'1px solid var(--line)'}}>
      <div style={{fontSize:13, color:'var(--ink-2)', flexShrink:0, marginRight:16}}>{label}</div>
      <div style={{fontSize:14, color:'var(--ink)', textAlign:'right', fontWeight:500}}>{value}</div>
    </div>
  )
}

function SignaturePad({ onChange }: { onChange:(drawn:boolean)=>void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    ctx.lineCap = 'round'; ctx.lineWidth = 2.4; ctx.strokeStyle = '#1F1A14'
    const getPos = (e:PointerEvent) => {
      const r = c.getBoundingClientRect()
      return {x:((e.clientX-r.left)/r.width)*c.width, y:((e.clientY-r.top)/r.height)*c.height}
    }
    const start = (e:PointerEvent) => { drawingRef.current=true; const p=getPos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y) }
    const move  = (e:PointerEvent) => {
      if (!drawingRef.current) return; e.preventDefault()
      const p=getPos(e); ctx.lineTo(p.x,p.y); ctx.stroke()
      if (!drawn) { setDrawn(true); onChange(true) }
    }
    const end = () => { drawingRef.current = false }
    c.addEventListener('pointerdown', start)
    c.addEventListener('pointermove', move, {passive:false})
    window.addEventListener('pointerup', end)
    return () => { c.removeEventListener('pointerdown',start); c.removeEventListener('pointermove',move); window.removeEventListener('pointerup',end) }
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
