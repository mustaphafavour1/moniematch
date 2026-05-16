'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile } from '@/lib/db'
import { saveInvestorProfile } from '@/lib/auth'
import { fmtNaira } from '@/lib/utils'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'

const ALL_CATS = ['Bakery','Fashion','Food','Barbing','Beauty','Repair','Retail','Laundry','Tailoring','Photography']
const CADENCE  = ['Weekly','Monthly','Quarterly']

const fmtNum  = (v: number) => v === 0 ? '' : v.toLocaleString('en-NG')
const parseNum = (s: string) => { const n = parseInt(s.replace(/,/g, ''), 10); return isNaN(n) ? 0 : n }

export default function InvPrefsPage() {
  const router = useRouter()
  const [cats,       setCats]       = useState<string[]>(['Bakery','Fashion','Food'])
  const [minAmt,     setMinAmt]     = useState(100_000)
  const [maxAmt,     setMaxAmt]     = useState(1_500_000)
  const [returnStructures, setReturnStructures] = useState<string[]>(['revenue_share'])
  const [cadence,    setCadence]    = useState<string[]>(['Monthly'])
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    getMyProfile().then(p => {
      if (!p) return
      if (p.interests?.length)      setCats(p.interests)
      if (p.rangeMin)               setMinAmt(p.rangeMin)
      if (p.rangeMax)               setMaxAmt(p.rangeMax)
      if (p.returnStructures?.length) setReturnStructures(p.returnStructures)
      if (p.reportingCadence?.length) setCadence(p.reportingCadence)
    })
  }, [])

  const toggle         = (c: string) => setCats(cs => cs.includes(c) ? cs.filter(x=>x!==c) : [...cs, c])
  const toggleCad      = (c: string) => setCadence(cs => cs.includes(c) ? cs.filter(x=>x!==c) : [...cs, c])
  const toggleReturn   = (v: string) => setReturnStructures(rs => rs.includes(v) ? rs.filter(x=>x!==v) : [...rs, v])

  const save = async () => {
    if (minAmt >= maxAmt) { setError('Minimum must be less than maximum.'); return }
    setSaving(true)
    setError('')
    try {
      await saveInvestorProfile({
        interests:         cats,
        investment_range:  `${fmtNaira(minAmt, {compact:true})} – ${fmtNaira(maxAmt, {compact:true})}`,
        return_structures: returnStructures,
        reporting_cadence: cadence,
      })
      router.back()
    } catch(e) { setError('Failed to save. Please try again.'); console.warn('[MM] save prefs:', e) }
    setSaving(false)
  }

  const pillStyle = (on: boolean, accent: string) => ({
    appearance: 'none' as const, border: '1.5px solid',
    borderColor:  on ? `var(--${accent})` : 'var(--line-strong)',
    background:   on ? `var(--${accent}-tint)` : 'transparent',
    color:        on ? `var(--${accent})` : 'var(--ink-2)',
    padding: '8px 14px', borderRadius: 999,
    fontSize: 13, fontWeight: on ? 600 : 500,
    cursor: 'pointer' as const, fontFamily: 'var(--font-body)', transition: 'all 180ms',
  })

  return (
    <div className="app-screen" style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <AppHeader title="Match preferences"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18}/></RoundBtn>} sticky />
      <div className="scroll" style={{flex:1}}>
        <div className="pad" style={{paddingTop:8}}>
          <p style={{fontSize:13.5, color:'var(--ink-2)', margin:'0 0 24px', lineHeight:1.5}}>
            Tell us more about what you&apos;re looking for and we&apos;ll improve your matches.
          </p>

          {/* Business types */}
          <div className="eyebrow">Business types I&apos;m interested in</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:8, margin:'12px 0 24px'}}>
            {ALL_CATS.map(c => (
              <button key={c} onClick={() => toggle(c)} style={pillStyle(cats.includes(c), 'clay')}>{c}</button>
            ))}
          </div>

          {/* Investment range */}
          <div className="eyebrow">Investment range</div>
          <div className="card" style={{padding:16, margin:'12px 0 24px'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {[
                {label:'Minimum', val:minAmt, set:setMinAmt},
                {label:'Maximum', val:maxAmt, set:setMaxAmt},
              ].map(({label, val, set}) => (
                <div key={label}>
                  <p style={{fontSize:11.5, color:'var(--ink-3)', margin:'0 0 6px', fontWeight:500}}>{label}</p>
                  <div style={{background:'var(--bone)', border:'1px solid var(--line-strong)',
                    borderRadius:10, padding:'10px 12px', display:'flex', alignItems:'center', gap:4}}>
                    <span style={{fontSize:13, color:'var(--ink-3)'}}>₦</span>
                    <input
                      type="text" inputMode="numeric"
                      value={fmtNum(val)}
                      onChange={e => set(parseNum(e.target.value))}
                      placeholder="0"
                      style={{flex:1, border:0, background:'transparent', outline:'none',
                        fontFamily:'var(--font-body)', fontSize:14, color:'var(--ink)'}} />
                  </div>
                  <p style={{fontSize:11, color:'var(--clay)', margin:'4px 0 0'}}>{fmtNaira(val, {compact:true})}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reporting cadence */}
          <div className="eyebrow">Reporting cadence</div>
          <p style={{fontSize:13, color:'var(--ink-3)', margin:'6px 0 10px', lineHeight:1.45}}>
            How often do you want updates from businesses?
          </p>
          <div style={{display:'flex', flexWrap:'wrap', gap:8, margin:'0 0 24px'}}>
            {CADENCE.map(c => (
              <button key={c} onClick={() => toggleCad(c)} style={pillStyle(cadence.includes(c), 'clay')}>{c}</button>
            ))}
          </div>

          {/* Return structure */}
          <div className="eyebrow">Preferred return structure</div>
          <p style={{fontSize:13, color:'var(--ink-3)', margin:'6px 0 12px', lineHeight:1.45}}>
            Select all that you&apos;re open to.
          </p>
          <div className="col gap-10" style={{margin:'0 0 32px'}}>
            {[
              {val:'revenue_share', label:'Revenue share', desc:'A percentage of monthly revenue until a target total is reached'},
              {val:'fixed',         label:'Fixed returns',  desc:'Set monthly repayments over an agreed timeline'},
              {val:'equity',        label:'Equity',         desc:'An ownership stake in the business in exchange for your investment'},
            ].map(opt => {
              const on = returnStructures.includes(opt.val)
              return (
                <div key={opt.val} onClick={() => toggleReturn(opt.val)} style={{
                  background: on ? 'var(--clay-tint)' : 'var(--bone)',
                  border:`1.5px solid ${on ? 'var(--clay)' : 'var(--line-strong)'}`,
                  borderRadius:14, padding:'14px 16px',
                  cursor:'pointer', display:'flex', alignItems:'flex-start', gap:12,
                  transition:'all 180ms',
                }}>
                  <div style={{width:18, height:18, borderRadius:4, flexShrink:0, marginTop:2,
                    border:`2px solid ${on ? 'var(--clay)' : 'var(--line-strong)'}`,
                    background: on ? 'var(--clay)' : 'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {on && <span style={{color:'#fff', fontSize:11, lineHeight:1, fontWeight:700}}>✓</span>}
                  </div>
                  <div>
                    <p style={{fontSize:14, fontWeight:600, color:'var(--ink)', margin:'0 0 3px'}}>{opt.label}</p>
                    <p style={{fontSize:12.5, color:'var(--ink-2)', margin:0, lineHeight:1.4}}>{opt.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {error && (
            <div style={{background:'var(--clay-tint)', border:'1px solid var(--clay)',
              borderRadius:12, padding:'10px 14px', fontSize:13, color:'var(--clay)', marginBottom:16}}>
              {error}
            </div>
          )}
        </div>
      </div>
      <div style={{padding:'12px 22px 28px', borderTop:'1px solid var(--line)', background:'var(--cream)'}}>
        <button onClick={save} disabled={saving} className="btn btn-primary btn-block">
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </div>
  )
}
