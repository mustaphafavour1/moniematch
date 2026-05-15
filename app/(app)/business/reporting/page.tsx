'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { fmtNaira } from '@/lib/utils'

// Mock draft data — replace with real DB call when reporting is wired
const DRAFT = {
  month:           'April 2026 Report',
  voiceTranscript: 'April was honestly one of our best months. We sold out of croissants three times. Revenue was strong, around 680k I think. We had some flour costs go up though.',
  metrics: { revenue:680_000, revenueDelta:14, expenses:210_000, profit:470_000, soldOutDays:3, bestDay:{ date:'Apr 12', amount:45_000 } },
  highlights: ['Croissants sold out 3× — introducing weekend double batch', 'Added 2 new corporate clients for weekly orders', 'Expanded opening hours to 7am — positive feedback'],
  watch:      ['Flour cost up 18% — may affect margins in May', 'One delivery partner unreliable — sourcing backup'],
  payoutDue:  54_400,
}

export default function BizReportingPage() {
  const router  = useRouter()
  const [stage,   setStage]   = useState(0)  // 0 prompt, 1 recording, 2 transcribing, 3 review, 4 sent
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (stage === 1) {
      const i = setInterval(() => setSeconds(s => s+1), 1000)
      return () => clearInterval(i)
    }
  }, [stage])

  useEffect(() => {
    if (stage === 2) { const t = setTimeout(() => setStage(3), 2200); return () => clearTimeout(t) }
  }, [stage])

  return (
    <div className="app-screen">
      <div className="statusbar-spacer" />
      <AppHeader title="April 2026 report"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="close" size={18} /></RoundBtn>} />

      {/* ── Stage 0: Prompt ── */}
      {stage === 0 && (
        <div className="scroll fadein" style={{flex:1, padding:'0 22px 100px'}}>
          <div className="eyebrow" style={{marginTop:8}}>3 investors waiting · 2 days due</div>
          <div className="h1" style={{fontSize:30, marginTop:6}}>
            Tell us how April went.<br/>
            <span style={{fontStyle:'italic', color:'var(--forest)'}}>We&apos;ll write the report.</span>
          </div>
          <p style={{color:'var(--ink-2)', fontSize:14, lineHeight:1.5, margin:'10px 0 22px'}}>
            Speak as long or as short as you like — revenue, expenses, anything new. About 60 seconds is plenty.
          </p>
          <div className="card sand">
            <div className="eyebrow" style={{marginBottom:8}}>What investors will see</div>
            <div className="col gap-8" style={{fontSize:13}}>
              <div className="row gap-8"><Icon name="trend-up" size={14} color="var(--forest)" /> Revenue, change vs last month</div>
              <div className="row gap-8"><Icon name="chart"    size={14} color="var(--forest)" /> Profit &amp; expenses</div>
              <div className="row gap-8"><Icon name="sparkle" size={14} color="var(--forest)" /> Highlights &amp; things to watch</div>
              <div className="row gap-8"><Icon name="money"   size={14} color="var(--forest)" /> Their payout for the month</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage 1: Recording ── */}
      {stage === 1 && (
        <div className="fadein" style={{flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', padding:32, textAlign:'center'}}>
          <div style={{position:'relative', width:160, height:160}}>
            <div style={{position:'absolute', inset:0, borderRadius:999, background:'var(--clay)',
              animation:'pulse-soft 1.8s ease-in-out infinite', opacity:0.16}} />
            <div style={{position:'absolute', inset:16, borderRadius:999, background:'var(--clay)',
              animation:'pulse-soft 1.8s ease-in-out infinite', animationDelay:'0.2s', opacity:0.24}} />
            <div style={{position:'absolute', inset:32, borderRadius:999, background:'var(--clay)', color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-md)'}}>
              <Icon name="mic" size={42} color="#fff" />
            </div>
          </div>
          <div style={{fontFamily:'var(--font-display)', fontSize:32, marginTop:24, color:'var(--ink)'}}>
            {String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}
          </div>
          <div className="row gap-4" style={{marginTop:18, color:'var(--clay)'}}>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} className="wave-bar" style={{animationDelay:`${i*0.1}s`}} />
            ))}
          </div>
          <p style={{color:'var(--ink-3)', fontSize:13, marginTop:18}}>Listening… speak naturally.</p>
        </div>
      )}

      {/* ── Stage 2: Transcribing ── */}
      {stage === 2 && (
        <div className="fadein" style={{flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', padding:32, textAlign:'center'}}>
          <div style={{width:80, height:80, borderRadius:20, background:'var(--linen)',
            display:'flex', alignItems:'center', justifyContent:'center', color:'var(--clay)',
            animation:'pulse-soft 1.4s ease-in-out infinite'}}>
            <Icon name="sparkle" size={40} color="var(--clay)" />
          </div>
          <div className="h2" style={{marginTop:22}}>Writing your report…</div>
          <p style={{color:'var(--ink-2)', fontSize:13, marginTop:6}}>
            Pulling revenue figures · structuring highlights
          </p>
        </div>
      )}

      {/* ── Stage 3: Review ── */}
      {stage === 3 && (
        <div className="scroll fadein" style={{flex:1, paddingBottom:100}}>
          <div className="pad">
            <div className="row gap-8" style={{marginBottom:8}}>
              <span className="chip clay"><Icon name="sparkle" size={11} color="var(--clay)" /> AI-drafted</span>
              <span className="chip outline">Editable</span>
            </div>
            <div className="h2">{DRAFT.month}</div>
            <p style={{color:'var(--ink-2)', fontSize:13, lineHeight:1.5, margin:'8px 0 0', fontStyle:'italic'}}>
              &ldquo;{DRAFT.voiceTranscript.slice(0,120)}…&rdquo;
            </p>
          </div>

          <div className="pad" style={{marginTop:18}}>
            <div className="card">
              <div className="row between">
                <div>
                  <div style={{fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:0.04}}>April revenue</div>
                  <div style={{fontFamily:'var(--font-display)', fontSize:30, color:'var(--ink)'}}>
                    {fmtNaira(DRAFT.metrics.revenue)}
                  </div>
                </div>
                <span className="chip forest">+{DRAFT.metrics.revenueDelta}% vs Mar</span>
              </div>
              <div className="hr" style={{margin:'12px 0'}} />
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
                {[
                  {label:'Expenses',    value:fmtNaira(DRAFT.metrics.expenses,{compact:true})},
                  {label:'Profit',      value:fmtNaira(DRAFT.metrics.profit,{compact:true})},
                  {label:'Sold-out',    value:`${DRAFT.metrics.soldOutDays} days`},
                  {label:'Best day',    value:`${DRAFT.metrics.bestDay.date} · ${fmtNaira(DRAFT.metrics.bestDay.amount,{compact:true})}`},
                ].map(s => (
                  <div key={s.label}>
                    <div style={{fontSize:10.5, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:0.05}}>{s.label}</div>
                    <div style={{fontFamily:'var(--font-display)', fontSize:18, marginTop:2, color:'var(--ink)'}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pad" style={{marginTop:14}}>
            <div className="eyebrow" style={{marginBottom:8}}>Highlights</div>
            <div className="card" style={{padding:0, overflow:'hidden'}}>
              {DRAFT.highlights.map((h, i) => (
                <div key={i} className="row gap-10" style={{padding:'12px 14px',
                  borderBottom:i===DRAFT.highlights.length-1?0:'1px solid var(--line)'}}>
                  <div style={{width:22, height:22, borderRadius:999, background:'var(--forest-tint)', color:'var(--forest)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <Icon name="check" size={12} color="var(--forest)" strokeWidth={2.6} />
                  </div>
                  <div style={{fontSize:13.5, color:'var(--ink)'}}>{h}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pad" style={{marginTop:14}}>
            <div className="eyebrow" style={{marginBottom:8}}>Things to watch</div>
            <div className="card" style={{padding:0, overflow:'hidden', borderColor:'rgba(229,160,74,0.35)'}}>
              {DRAFT.watch.map((h, i) => (
                <div key={i} className="row gap-10" style={{padding:'12px 14px',
                  borderBottom:i===DRAFT.watch.length-1?0:'1px solid var(--line)'}}>
                  <div style={{width:22, height:22, borderRadius:999, background:'var(--sun-tint)', color:'#8a5d10',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <Icon name="alert" size={12} color="#8a5d10" />
                  </div>
                  <div style={{fontSize:13.5, color:'var(--ink)'}}>{h}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pad" style={{marginTop:14}}>
            <div className="card" style={{background:'var(--forest)', borderColor:'rgba(45,93,63,0.5)'}}>
              <div className="eyebrow" style={{color:'rgba(255,255,255,0.7)', marginBottom:6}}>Investor payout (auto-calc)</div>
              <div className="row between" style={{alignItems:'flex-end'}}>
                <div style={{fontFamily:'var(--font-display)', fontSize:28, color:'#fff'}}>{fmtNaira(DRAFT.payoutDue)}</div>
                <div style={{fontSize:12, color:'rgba(255,255,255,0.85)'}}>8% of {fmtNaira(DRAFT.metrics.revenue,{compact:true})}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage 4: Sent ── */}
      {stage === 4 && (
        <div className="fadein" style={{flex:1, display:'flex', flexDirection:'column', padding:'20px 22px'}}>
          <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
            <div style={{width:88, height:88, borderRadius:999, background:'var(--forest-tint)', color:'var(--forest)',
              display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Icon name="send" size={44} color="var(--forest)" />
            </div>
            <div className="h1" style={{fontSize:30, marginTop:24}}>Sent.</div>
            <p style={{color:'var(--ink-2)', fontSize:14, marginTop:10, maxWidth:280, lineHeight:1.5}}>
              Your April report is in 3 investor inboxes. Payout of {fmtNaira(DRAFT.payoutDue)} will be released within 24 hours.
            </p>
          </div>
          <button className="btn btn-forest btn-block" onClick={() => router.replace('/business')}>Done</button>
        </div>
      )}

      {/* Fixed bottom CTA */}
      {stage < 4 && stage !== 1 && stage !== 2 && (
        <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'14px 16px 22px',
          background:'linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)'}}>
          {stage === 0 && (
            <button className="btn btn-clay btn-block" onClick={() => { setSeconds(0); setStage(1) }}>
              <Icon name="mic" size={16} color="#fff" /> Start recording
            </button>
          )}
          {stage === 3 && (
            <div className="row gap-8">
              <button className="btn btn-soft" style={{flex:1}}>Edit</button>
              <button className="btn btn-forest" style={{flex:1.6}} onClick={() => setStage(4)}>Send to 3 investors</button>
            </div>
          )}
        </div>
      )}
      {stage === 1 && (
        <div style={{position:'absolute', left:0, right:0, bottom:0, padding:'14px 16px 22px',
          background:'linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)'}}>
          <button className="btn btn-primary btn-block" onClick={() => setStage(2)}>
            <Icon name="check" size={16} color="currentColor" /> Done · transcribe
          </button>
        </div>
      )}
    </div>
  )
}
