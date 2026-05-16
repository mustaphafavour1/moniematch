'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile } from '@/lib/db'
import { saveBusinessProfile } from '@/lib/auth'
import { fmtNaira } from '@/lib/utils'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'

const CATS     = ['Bakery','Fashion','Food','Barbing','Beauty','Repair','Retail','Laundry','Tailoring','Photography','Other']
const REVENUES = ['Under ₦50,000','₦50k – ₦150k','₦150k – ₦500k','₦500k – ₦1M','Over ₦1M']
const CADENCE  = ['Weekly','Monthly','Quarterly']
const RETURNS  = [
  { val: 'revenue_share', label: 'Revenue share' },
  { val: 'fixed',         label: 'Fixed returns' },
  { val: 'equity',        label: 'Equity' },
]

const fmtNum   = (v: number) => v === 0 ? '' : v.toLocaleString('en-NG')
const parseNum = (s: string) => { const n = parseInt(s.replace(/,/g, ''), 10); return isNaN(n) ? 0 : n }

export default function BizProfileEditPage() {
  const router = useRouter()
  const [bizName,   setBizName]   = useState('')
  const [category,  setCategory]  = useState('')
  const [desc,      setDesc]      = useState('')
  const [revenue,   setRevenue]   = useState('')
  const [minAsk,    setMinAsk]    = useState(0)
  const [maxAsk,    setMaxAsk]    = useState(0)
  const [useOfFunds,setUseOfFunds]= useState('')
  const [cadence,   setCadence]   = useState<string[]>(['Monthly'])
  const [returns,   setReturns]   = useState<string[]>([])
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    getMyProfile().then(p => {
      if (!p) return
      if (p.bizName)    setBizName(p.bizName)
      if (p.category)   setCategory(p.category)
      if (p.description) setDesc(p.description)
      if (p.reportingCadence?.length) setCadence(p.reportingCadence)
      if (p.returnStructures?.length) setReturns(p.returnStructures)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pa = p as any
      if (pa.askMin) setMinAsk(pa.askMin)
      if (pa.askMax) setMaxAsk(pa.askMax)
    })
  }, [])

  const toggleCad = (c: string) => setCadence(cs => cs.includes(c) ? cs.filter(x=>x!==c) : [...cs, c])
  const toggleReturn = (v: string) => setReturns(rs => rs.includes(v) ? rs.filter(x=>x!==v) : [...rs, v])

  const save = async () => {
    if (minAsk > 0 && maxAsk > 0 && minAsk >= maxAsk) { setError('Minimum ask must be less than maximum.'); return }
    setSaving(true)
    setError('')
    try {
      await saveBusinessProfile({
        name:              bizName,
        category,
        description:       desc,
        revenue_range:     revenue,
        use_of_funds:      useOfFunds,
        investment_needed: minAsk || maxAsk
          ? `${fmtNaira(minAsk, {compact:true})} – ${fmtNaira(maxAsk, {compact:true})}`
          : null,
        reporting_cadence: cadence,
        return_structures: returns,
      })
      router.back()
    } catch(e) { setError('Failed to save. Please try again.'); console.warn('[MM] save biz profile:', e) }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width:'100%', border:0, background:'transparent', outline:'none',
    fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)',
  }
  const fieldWrap: React.CSSProperties = {
    background:'var(--bone)', border:'1px solid var(--line-strong)',
    borderRadius:14, padding:'12px 16px',
  }
  const pillStyle = (on: boolean) => ({
    appearance: 'none' as const, border: '1.5px solid',
    borderColor:  on ? 'var(--forest)' : 'var(--line-strong)',
    background:   on ? 'var(--forest-tint)' : 'transparent',
    color:        on ? 'var(--forest)' : 'var(--ink-2)',
    padding: '7px 12px', borderRadius: 999,
    fontSize: 12.5, fontWeight: on ? 600 : 500,
    cursor: 'pointer' as const, fontFamily: 'var(--font-body)', transition: 'all 160ms',
  })

  return (
    <div className="app-screen" style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <AppHeader title="Edit profile"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18}/></RoundBtn>} sticky />
      <div className="scroll" style={{flex:1}}>
        <div className="pad col gap-20" style={{paddingTop:8, paddingBottom:32}}>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Business name</p>
            <div style={fieldWrap}>
              <input value={bizName} onChange={e=>setBizName(e.target.value)}
                placeholder="e.g. Layi Bakehouse" style={inputStyle} />
            </div>
          </div>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Category</p>
            <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={pillStyle(category===c)}>{c}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>One-sentence description</p>
            <div style={fieldWrap}>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)}
                placeholder="e.g. We bake artisan bread and pastries for Lagos homes and offices"
                rows={3} style={{...inputStyle, resize:'none', lineHeight:1.5}} />
            </div>
          </div>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Monthly revenue range</p>
            <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
              {REVENUES.map(r => (
                <button key={r} onClick={() => setRevenue(r)} style={pillStyle(revenue===r)}>{r}</button>
              ))}
            </div>
          </div>

          {/* Investment ask — min/max */}
          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Investment ask</p>
            <p style={{fontSize:13, color:'var(--ink-3)', margin:'0 0 10px', lineHeight:1.45}}>
              How much are you looking to raise? (numbers only)
            </p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {[
                {label:'Minimum (₦)', val:minAsk, set:setMinAsk},
                {label:'Maximum (₦)', val:maxAsk, set:setMaxAsk},
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
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>What the investment will be used for</p>
            <div style={fieldWrap}>
              <textarea value={useOfFunds} onChange={e=>setUseOfFunds(e.target.value)}
                placeholder="e.g. New industrial oven (₦300k) and 3 months of raw materials (₦200k)"
                rows={3} style={{...inputStyle, resize:'none', lineHeight:1.5}} />
            </div>
          </div>

          {/* Return structure */}
          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Return type offered to investors</p>
            <p style={{fontSize:13, color:'var(--ink-3)', margin:'0 0 10px', lineHeight:1.45}}>
              How will investors get their money back?
            </p>
            <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
              {RETURNS.map(r => {
                const on = returns.includes(r.val)
                return (
                  <button key={r.val} onClick={() => toggleReturn(r.val)} style={{
                    appearance:'none', border:'1.5px solid',
                    borderColor: on ? 'var(--forest)' : 'var(--line-strong)',
                    background:  on ? 'var(--forest-tint)' : 'transparent',
                    color:       on ? 'var(--forest)' : 'var(--ink-2)',
                    padding:'7px 14px', borderRadius:999,
                    fontSize:13, fontWeight: on ? 600 : 500,
                    cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 160ms',
                    display:'flex', alignItems:'center', gap:6,
                  }}>
                    <span style={{width:14, height:14, borderRadius:3, border:`1.5px solid ${on ? 'var(--forest)' : 'var(--line-strong)'}`,
                      background: on ? 'var(--forest)' : 'transparent', display:'inline-flex',
                      alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      {on && <span style={{color:'#fff', fontSize:9, lineHeight:1}}>✓</span>}
                    </span>
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reporting cadence */}
          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Reporting cadence</p>
            <p style={{fontSize:13, color:'var(--ink-3)', margin:'0 0 10px', lineHeight:1.45}}>
              How often will you send investors updates?
            </p>
            <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
              {CADENCE.map(c => (
                <button key={c} onClick={() => toggleCad(c)} style={pillStyle(cadence.includes(c))}>{c}</button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{background:'var(--clay-tint)', border:'1px solid var(--clay)',
              borderRadius:12, padding:'10px 14px', fontSize:13, color:'var(--clay)'}}>
              {error}
            </div>
          )}
        </div>
      </div>
      <div style={{padding:'12px 22px 28px', borderTop:'1px solid var(--line)', background:'var(--cream)'}}>
        <button onClick={save} disabled={saving} className="btn btn-forest btn-block">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
