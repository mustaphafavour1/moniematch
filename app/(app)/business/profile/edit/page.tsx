'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile } from '@/lib/db'
import { saveBusinessProfile } from '@/lib/auth'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'

const CATS     = ['Bakery','Fashion','Food','Barbing','Beauty','Repair','Retail','Laundry','Tailoring','Photography','Other']
const REVENUES = ['Under ₦50,000','₦50k – ₦150k','₦150k – ₦500k','₦500k – ₦1M','Over ₦1M']

export default function BizProfileEditPage() {
  const router = useRouter()
  const [bizName,     setBizName]     = useState('')
  const [category,    setCategory]    = useState('')
  const [desc,        setDesc]        = useState('')
  const [revenue,     setRevenue]     = useState('')
  const [ask,         setAsk]         = useState('')
  const [useOfFunds,  setUseOfFunds]  = useState('')
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    getMyProfile().then(p => {
      if (!p) return
      if (p.bizName)    setBizName(p.bizName)
      if (p.category)   setCategory(p.category)
      if (p.description) setDesc(p.description)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await saveBusinessProfile({
        name:              bizName,
        category,
        description:       desc,
        revenue_range:     revenue,
        use_of_funds:      useOfFunds,
        investment_needed: ask,
      })
      router.back()
    } catch(e) { console.warn('[MM] save biz profile:', e) }
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

  return (
    <div className="app-screen" style={{display:'flex', flexDirection:'column', height:'100%'}}>
      <AppHeader title="Edit profile"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18}/></RoundBtn>} sticky />
      <div className="scroll" style={{flex:1}}>
        <div className="pad col gap-20" style={{paddingTop:8}}>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Business name</p>
            <div style={fieldWrap}><input value={bizName} onChange={e=>setBizName(e.target.value)} placeholder="e.g. Layi Bakehouse" style={inputStyle} /></div>
          </div>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Category</p>
            <div style={{display:'flex', flexWrap:'wrap', gap:7}}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  appearance:'none', border:'1.5px solid',
                  borderColor:  category===c ? 'var(--forest)' : 'var(--line-strong)',
                  background:   category===c ? 'var(--forest-tint)' : 'transparent',
                  color:        category===c ? 'var(--forest)' : 'var(--ink-2)',
                  padding:'7px 12px', borderRadius:999,
                  fontSize:12.5, fontWeight:category===c?600:500,
                  cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 160ms',
                }}>{c}</button>
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
                <button key={r} onClick={() => setRevenue(r)} style={{
                  appearance:'none', border:'1.5px solid',
                  borderColor: revenue===r ? 'var(--forest)' : 'var(--line-strong)',
                  background:  revenue===r ? 'var(--forest-tint)' : 'transparent',
                  color:       revenue===r ? 'var(--forest)' : 'var(--ink-2)',
                  padding:'7px 12px', borderRadius:999,
                  fontSize:12.5, fontWeight:revenue===r?600:500,
                  cursor:'pointer', fontFamily:'var(--font-body)', transition:'all 160ms',
                }}>{r}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>Investment ask</p>
            <div style={fieldWrap}><input value={ask} onChange={e=>setAsk(e.target.value)} placeholder="e.g. ₦200k minimum · ₦800k ideal" style={inputStyle} /></div>
          </div>

          <div>
            <p className="eyebrow" style={{marginBottom:8}}>What the investment will be used for</p>
            <div style={fieldWrap}>
              <textarea value={useOfFunds} onChange={e=>setUseOfFunds(e.target.value)}
                placeholder="e.g. New industrial oven (₦300k) and 3 months of raw materials (₦200k)"
                rows={3} style={{...inputStyle, resize:'none', lineHeight:1.5}} />
            </div>
          </div>

          <div style={{height:20}} />
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