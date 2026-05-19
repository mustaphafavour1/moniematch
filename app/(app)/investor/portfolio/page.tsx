'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyPortfolio, getMyOffers, getMyTemplates } from '@/lib/db'
import type { InvestorOffer } from '@/lib/db'
import { fmtNaira } from '@/lib/utils'
import type { Deal } from '@/lib/types'
import { Progress } from '@/components/app/Progress'
import { colorFor, initialsFor } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pending',  color: 'var(--ink-2)',  bg: 'var(--linen)' },
  accepted: { label: 'Accepted', color: 'var(--forest)', bg: 'var(--linen)' },
  rejected: { label: 'Declined', color: 'var(--clay)',   bg: '#fef2f2' },
  countered:{ label: 'Countered',color: '#b45309',       bg: '#fef9ec' },
  withdrawn:{ label: 'Withdrawn',color: 'var(--ink-3)',  bg: 'var(--linen)' },
}

const RETURN_LABEL: Record<string, string> = {
  revenue_share: 'Revenue share',
  fixed:         'Fixed returns',
  equity:        'Equity',
  balanced:      'Either works',
}

function returnSummary(o: InvestorOffer) {
  if (o.return_type === 'equity'   && o.equity_percent)   return `${o.equity_percent}% equity`
  if (o.return_type === 'revenue_share' && o.revenue_percent) return `${o.revenue_percent}% revenue`
  if (o.roi_percent)                                       return `${o.roi_percent}% ROI`
  if (o.total_return_amount)                               return `₦${Number(o.total_return_amount).toLocaleString()} total`
  return RETURN_LABEL[o.return_type] || o.return_type
}

export default function InvPortfolioPage() {
  const router = useRouter()
  const [deals,     setDeals]     = useState<Deal[] | null>(null)
  const [offers,    setOffers]    = useState<InvestorOffer[] | null>(null)
  const [templates, setTemplates] = useState<InvestorOffer[] | null>(null)

  // Template edit sheet state
  const [editingTemplate, setEditingTemplate] = useState<InvestorOffer | null>(null)
  const [editName,        setEditName]        = useState('')
  const [editAmount,      setEditAmount]      = useState('')
  const [editReturnType,  setEditReturnType]  = useState('fixed')
  const [editRoiPct,      setEditRoiPct]      = useState('')
  const [editRevPct,      setEditRevPct]      = useState('')
  const [editEqPct,       setEditEqPct]       = useState('')
  const [editTotal,       setEditTotal]       = useState('')
  const [editReporting,   setEditReporting]   = useState('monthly')
  const [editNotes,       setEditNotes]       = useState('')
  const [editSaving,      setEditSaving]      = useState(false)
  const [editDeleting,    setEditDeleting]    = useState(false)
  const [confirmDelete,   setConfirmDelete]   = useState(false)
  const [editError,       setEditError]       = useState('')

  useEffect(() => {
    getMyPortfolio().then(setDeals).catch(() => setDeals([]))
    getMyOffers().then(setOffers).catch(() => setOffers([]))
    getMyTemplates().then(setTemplates).catch(() => setTemplates([]))
  }, [])

  const loading         = deals === null
  const offersLoading   = offers === null
  const templatesLoading = templates === null
  const items           = deals || []
  const offerItems      = offers || []
  const templateItems   = templates || []
  const total = items.reduce((s, p) => s + (p.invested || p.amount || 0), 0)
  const paid  = items.reduce((s, p) => s + (p.paidBack || 0), 0)

  function openEditSheet(o: InvestorOffer) {
    setEditingTemplate(o)
    setEditName(o.template_name || '')
    setEditAmount(o.amount ? String(o.amount) : '')
    setEditReturnType(o.return_type || 'fixed')
    setEditRoiPct(o.roi_percent != null ? String(o.roi_percent) : '')
    setEditRevPct(o.revenue_percent != null ? String(o.revenue_percent) : '')
    setEditEqPct(o.equity_percent != null ? String(o.equity_percent) : '')
    setEditTotal(o.total_return_amount != null ? String(o.total_return_amount) : '')
    setEditReporting(o.reporting_frequency || 'monthly')
    setEditNotes(o.notes || '')
    setEditSaving(false)
    setEditDeleting(false)
    setConfirmDelete(false)
    setEditError('')
  }

  function closeEditSheet() {
    setEditingTemplate(null)
    setConfirmDelete(false)
    setEditError('')
  }

  async function handleEditSave() {
    if (!editingTemplate) return
    setEditSaving(true)
    setEditError('')
    const payload: Record<string, unknown> = {
      template_name:       editName || null,
      amount:              editAmount ? Number(editAmount) : null,
      return_type:         editReturnType,
      return_rate:         editRoiPct ? Number(editRoiPct) : null,
      revenue_percent:     editRevPct ? Number(editRevPct) : null,
      equity_percent:      editEqPct ? Number(editEqPct) : null,
      total_return_amount: editTotal ? Number(editTotal) : null,
      reporting_frequency: editReporting,
      notes:               editNotes || null,
    }
    const { error } = await supabase.from('offers').update(payload).eq('id', editingTemplate.id)
    setEditSaving(false)
    if (error) {
      setEditError(error.message || 'Could not save changes.')
      return
    }
    // Update local state
    setTemplates(prev => prev
      ? prev.map(t => t.id === editingTemplate.id
          ? {
              ...t,
              template_name:       editName || undefined,
              amount:              editAmount ? Number(editAmount) : t.amount,
              return_type:         editReturnType,
              roi_percent:         editRoiPct ? Number(editRoiPct) : undefined,
              revenue_percent:     editRevPct ? Number(editRevPct) : undefined,
              equity_percent:      editEqPct ? Number(editEqPct) : undefined,
              total_return_amount: editTotal ? Number(editTotal) : undefined,
              reporting_frequency: editReporting,
              notes:               editNotes || undefined,
            }
          : t)
      : prev
    )
    closeEditSheet()
  }

  async function handleEditDelete() {
    if (!editingTemplate) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setEditDeleting(true)
    setEditError('')
    const { error } = await supabase.from('offers').delete().eq('id', editingTemplate.id)
    setEditDeleting(false)
    if (error) {
      setEditError(error.message || 'Could not delete template.')
      return
    }
    setTemplates(prev => prev ? prev.filter(t => t.id !== editingTemplate.id) : prev)
    closeEditSheet()
  }

  const sheetFieldStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
    fontSize: 15, color: 'var(--ink)', outline: 'none',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  }
  const sheetLabelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--ink-2)',
    textTransform: 'uppercase', letterSpacing: 0.8,
    display: 'block', marginBottom: 6,
  }

  return (
    <div className="app-screen scroll" style={{paddingBottom:32}}>
      <div className="pad" style={{paddingTop:14}}>
        <div className="eyebrow">Live deals</div>
        <div className="h1" style={{fontSize:36, marginTop:6}}>Portfolio</div>
      </div>

      {/* Summary card */}
      <div className="pad" style={{marginTop:18}}>
        <div className="card ink">
          <div className="row between">
            <div>
              <div style={{fontSize:11, color:'rgba(255,252,245,0.6)', textTransform:'uppercase', letterSpacing:0.05}}>Total deployed</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:32, color:'var(--cream)', marginTop:4}}>
                {loading ? '…' : fmtNaira(total)}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11, color:'rgba(255,252,245,0.6)', textTransform:'uppercase', letterSpacing:0.05}}>Paid back</div>
              <div style={{fontFamily:'var(--font-display)', fontSize:22, color:'var(--sun)', marginTop:4}}>
                {fmtNaira(paid, {compact:true})}
              </div>
            </div>
          </div>
          <div className="hr" style={{background:'rgba(255,252,245,0.1)', margin:'16px 0'}} />
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
            {[
              {label:'Active',    value: String(items.filter(d=>d.status==='active').length)},
              {label:'Offers',    value: offersLoading ? '…' : String(offerItems.length)},
              {label:'Templates', value: templates?.length ?? '…'},
            ].map(s => (
              <div key={s.label}>
                <div style={{fontSize:10, color:'rgba(255,252,245,0.55)', textTransform:'uppercase', letterSpacing:0.05}}>{s.label}</div>
                <div style={{fontFamily:'var(--font-display)', fontSize:22, marginTop:2, color:'var(--cream)'}}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="pad" style={{marginTop:22}}>
        <div className="eyebrow" style={{marginBottom:10}}>Positions</div>
        {loading
          ? [0,1].map(i => <div key={i} style={{height:110, borderRadius:18, background:'var(--linen)', marginBottom:10}} />)
          : items.length === 0
            ? (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:'40px 24px', gap:12, textAlign:'center'}}>
                <div style={{width:64, height:64, borderRadius:20, background:'var(--sun-tint)',
                  display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sun)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                <div>
                  <p style={{fontSize:17, fontFamily:'var(--font-display)', color:'var(--ink)', margin:'0 0 6px'}}>No active investments</p>
                  <p style={{fontSize:13, color:'var(--ink-2)', margin:0, lineHeight:1.55}}>Back your first business to start building your portfolio.</p>
                </div>
                <button onClick={() => router.push('/investor/matches')} className="btn btn-primary" style={{marginTop:4, padding:'11px 22px'}}>
                  Explore matches →
                </button>
              </div>
            )
            : (
              <div className="col gap-10">
                {items.map((p, i) => {
                  const biz = p.biz
                  if (!biz) return null
                  const pct = p.monthsTotal ? Math.round(((p.monthsIn||0)/p.monthsTotal)*100) : 0
                  return (
                    <div key={p.dealId || i} className="card fadein" style={{padding:14, cursor:'pointer', animationDelay:`${i*80}ms`}}>
                      <div className="row gap-12">
                        <div style={{width:48, height:48, borderRadius:12, background:`${biz.color}20`, color:biz.color,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontFamily:'var(--font-display)', fontSize:20, flexShrink:0}}>
                          {biz.initials}
                        </div>
                        <div style={{flex:1, minWidth:0}}>
                          <div className="row between">
                            <div style={{fontSize:14, color:'var(--ink)', fontWeight:500}}>{biz.business}</div>
                            <span className="chip forest">On track</span>
                          </div>
                          <div style={{fontSize:12, color:'var(--ink-3)'}}>{p.structure}</div>
                        </div>
                      </div>
                      <div className="row between" style={{marginTop:12}}>
                        <div className="col">
                          <div style={{fontSize:10, color:'var(--ink-3)', letterSpacing:0.05, textTransform:'uppercase'}}>Invested</div>
                          <div style={{fontSize:14, fontWeight:500, color:'var(--ink)'}}>{fmtNaira(p.invested||p.amount, {compact:true})}</div>
                        </div>
                        <div className="col">
                          <div style={{fontSize:10, color:'var(--ink-3)', letterSpacing:0.05, textTransform:'uppercase'}}>Paid back</div>
                          <div style={{fontSize:14, fontWeight:500, color:'var(--forest)'}}>{fmtNaira(p.paidBack||0, {compact:true})}</div>
                        </div>
                      </div>
                      <div style={{marginTop:10}}>
                        <Progress value={pct} color={biz.color} height={4} />
                        <div className="row between" style={{fontSize:11, color:'var(--ink-3)', marginTop:4}}>
                          <span>Month {p.monthsIn||0} of {p.monthsTotal||12}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
        }
      </div>

      {/* Offers */}
      <div className="pad" style={{marginTop:24}}>
        <div className="eyebrow" style={{marginBottom:10}}>Offers</div>
        {offersLoading
          ? [0,1].map(i => <div key={i} style={{height:72, borderRadius:16, background:'var(--linen)', marginBottom:10}} />)
          : offerItems.length === 0
            ? (
              <div style={{textAlign:'center', padding:'32px 24px', color:'var(--ink-3)', fontSize:13}}>
                No offers sent yet. Start a conversation and make your first offer.
              </div>
            )
            : (
              <div className="col gap-8">
                {offerItems.map((o, i) => {
                  const name     = o.biz_name || 'Business'
                  const initials = o.biz_initials || initialsFor(name)
                  const color    = o.biz_color    || colorFor(name)
                  const st       = STATUS_LABEL[o.status] || STATUS_LABEL.pending
                  return (
                    <div
                      key={o.id}
                      onClick={() => router.push(`/investor/chat/${o.match_id}/offer-view?offerId=${o.id}&mode=view`)}
                      className="card fadein"
                      style={{padding:'12px 14px', cursor:'pointer', animationDelay:`${i*60}ms`}}
                    >
                      <div style={{display:'flex', alignItems:'center', gap:12}}>
                        {/* Avatar */}
                        <div style={{width:40, height:40, borderRadius:11, background:`${color}20`, color,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontFamily:'var(--font-display)', fontSize:16, flexShrink:0}}>
                          {initials}
                        </div>

                        {/* Info */}
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                            <div style={{fontSize:14, color:'var(--ink)', fontWeight:500,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                              {name}
                            </div>
                            <span style={{flexShrink:0, fontSize:11, fontWeight:600,
                              color:st.color, background:st.bg,
                              borderRadius:999, padding:'3px 9px'}}>
                              {st.label}
                            </span>
                          </div>
                          <div style={{display:'flex', alignItems:'center', gap:8, marginTop:3}}>
                            <span style={{fontSize:13, color:'var(--ink)', fontWeight:500}}>
                              {fmtNaira(o.amount, {compact:true})}
                            </span>
                            <span style={{fontSize:11, color:'var(--ink-3)'}}>·</span>
                            <span style={{fontSize:12, color:'var(--ink-3)'}}>
                              {returnSummary(o)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
        }
      </div>

      {/* Templates */}
      {(templatesLoading || templateItems.length > 0) && (
        <div className="pad" style={{marginTop:24}}>
          <div className="eyebrow" style={{marginBottom:10}}>Saved templates</div>
          {templatesLoading
            ? [0].map(i => <div key={i} style={{height:72, borderRadius:16, background:'var(--linen)', marginBottom:10}} />)
            : (
              <div className="col gap-8">
                {templateItems.map((o, i) => {
                  const name     = o.template_name || 'Unnamed'
                  const initials = initialsFor(name)
                  const color    = colorFor(name)
                  return (
                    <div
                      key={o.id}
                      onClick={() => openEditSheet(o)}
                      className="card fadein"
                      style={{padding:'12px 14px', cursor:'pointer', animationDelay:`${i*60}ms`}}
                    >
                      <div style={{display:'flex', alignItems:'center', gap:12}}>
                        {/* Avatar */}
                        <div style={{width:40, height:40, borderRadius:11, background:`${color}20`, color,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontFamily:'var(--font-display)', fontSize:16, flexShrink:0}}>
                          {initials}
                        </div>

                        {/* Info */}
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
                            <div style={{fontSize:14, color:'var(--ink)', fontWeight:500,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                              {name}
                            </div>
                            <span style={{flexShrink:0, fontSize:11, fontWeight:600,
                              color:'var(--ink-3)', background:'var(--linen)',
                              borderRadius:999, padding:'3px 9px'}}>
                              Template
                            </span>
                          </div>
                          <div style={{display:'flex', alignItems:'center', gap:8, marginTop:3}}>
                            <span style={{fontSize:13, color:'var(--ink)', fontWeight:500}}>
                              {fmtNaira(o.amount, {compact:true})}
                            </span>
                            <span style={{fontSize:11, color:'var(--ink-3)'}}>·</span>
                            <span style={{fontSize:12, color:'var(--ink-3)'}}>
                              {returnSummary(o)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      )}

      {/* Template edit sheet */}
      {editingTemplate && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeEditSheet}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.45)',
            }}
          />

          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            background: 'var(--cream)',
            borderRadius: '20px 20px 0 0',
            maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.15)',
          }}>
            {/* Drag handle */}
            <div style={{display:'flex', justifyContent:'center', paddingTop:12, paddingBottom:4, flexShrink:0}}>
              <div style={{width:40, height:4, borderRadius:999, background:'var(--line-strong)'}} />
            </div>

            {/* Header */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 20px 14px', flexShrink:0,
              borderBottom:'1px solid var(--line)',
            }}>
              <div style={{fontFamily:'var(--font-display)', fontSize:20, color:'var(--ink)'}}>
                Edit template
              </div>
              <button
                onClick={closeEditSheet}
                style={{background:'none', border:'none', cursor:'pointer', padding:4,
                  fontSize:20, color:'var(--ink-3)', lineHeight:1}}
              >
                ×
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{overflowY:'auto', flex:1, padding:'20px 20px 32px'}}>
              <div style={{display:'flex', flexDirection:'column', gap:18}}>

                {/* Template name */}
                <div>
                  <label style={sheetLabelStyle}>Template name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="e.g. Standard 20% ROI"
                    style={sheetFieldStyle}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label style={sheetLabelStyle}>Amount (₦)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => {
                      const amt = e.target.value
                      setEditAmount(amt)
                      if (editReturnType === 'fixed' && editRoiPct && Number(amt) > 0) {
                        setEditTotal(String(Math.round(Number(amt) * (1 + Number(editRoiPct) / 100))))
                      }
                    }}
                    placeholder="e.g. 500000"
                    style={sheetFieldStyle}
                  />
                </div>

                {/* Return type */}
                <div>
                  <label style={sheetLabelStyle}>Return type</label>
                  <select
                    value={editReturnType}
                    onChange={e => setEditReturnType(e.target.value)}
                    style={{...sheetFieldStyle, appearance:'none'}}
                  >
                    <option value="fixed">Fixed returns</option>
                    <option value="revenue_share">Revenue share</option>
                    <option value="equity">Equity</option>
                  </select>
                </div>

                {/* Conditional return rate fields */}
                {editReturnType === 'fixed' && (
                  <div>
                    <label style={sheetLabelStyle}>ROI percent (%)</label>
                    <input
                      type="number"
                      value={editRoiPct}
                      onChange={e => {
                        const pct = e.target.value
                        setEditRoiPct(pct)
                        if (editAmount && Number(editAmount) > 0) {
                          setEditTotal(String(Math.round(Number(editAmount) * (1 + Number(pct) / 100))))
                        }
                      }}
                      placeholder="e.g. 20"
                      style={sheetFieldStyle}
                    />
                  </div>
                )}

                {editReturnType === 'revenue_share' && (
                  <div>
                    <label style={sheetLabelStyle}>Revenue percent (%)</label>
                    <input
                      type="number"
                      value={editRevPct}
                      onChange={e => setEditRevPct(e.target.value)}
                      placeholder="e.g. 15"
                      style={sheetFieldStyle}
                    />
                  </div>
                )}

                {editReturnType === 'equity' && (
                  <div>
                    <label style={sheetLabelStyle}>Equity percent (%)</label>
                    <input
                      type="number"
                      value={editEqPct}
                      onChange={e => setEditEqPct(e.target.value)}
                      placeholder="e.g. 5"
                      style={sheetFieldStyle}
                    />
                  </div>
                )}

                {/* Total return amount */}
                <div>
                  <label style={sheetLabelStyle}>Total return amount (₦)</label>
                  <input
                    type="number"
                    value={editTotal}
                    onChange={e => {
                      const tot = e.target.value
                      setEditTotal(tot)
                      if (editReturnType === 'fixed' && editAmount && Number(editAmount) > 0 && Number(tot) > 0) {
                        const pct = ((Number(tot) / Number(editAmount)) - 1) * 100
                        setEditRoiPct(String(Math.round(pct * 10) / 10))
                      }
                    }}
                    placeholder="e.g. 600000"
                    style={sheetFieldStyle}
                  />
                </div>

                {/* Reporting frequency */}
                <div>
                  <label style={sheetLabelStyle}>Reporting frequency</label>
                  <select
                    value={editReporting}
                    onChange={e => setEditReporting(e.target.value)}
                    style={{...sheetFieldStyle, appearance:'none'}}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label style={sheetLabelStyle}>Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Any additional terms or notes…"
                    rows={3}
                    style={{...sheetFieldStyle, resize:'vertical'}}
                  />
                </div>

                {/* Error */}
                {editError && (
                  <div style={{background:'#fef2f2', border:'1px solid #fecaca',
                    borderRadius:12, padding:'10px 14px', fontSize:13, color:'#7f1d1d'}}>
                    {editError}
                  </div>
                )}

                {/* Save button */}
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  style={{width:'100%', padding:'15px', borderRadius:14, border:'none',
                    background:'var(--forest)', color:'#fff', fontSize:15, fontWeight:700,
                    cursor:editSaving ? 'default' : 'pointer',
                    fontFamily:'var(--font-body)', opacity:editSaving ? 0.7 : 1}}
                >
                  {editSaving ? 'Saving…' : 'Save changes'}
                </button>

                {/* Delete button */}
                <button
                  onClick={handleEditDelete}
                  disabled={editDeleting}
                  style={{width:'100%', padding:'15px', borderRadius:14,
                    border: confirmDelete ? 'none' : '1.5px solid var(--clay)',
                    background: confirmDelete ? 'var(--clay)' : 'transparent',
                    color: confirmDelete ? '#fff' : 'var(--clay)',
                    fontSize:15, fontWeight:600,
                    cursor:editDeleting ? 'default' : 'pointer',
                    fontFamily:'var(--font-body)', opacity:editDeleting ? 0.7 : 1}}
                >
                  {editDeleting
                    ? 'Deleting…'
                    : confirmDelete
                      ? 'Confirm delete'
                      : 'Delete template'}
                </button>

                {confirmDelete && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    style={{width:'100%', padding:'10px', borderRadius:14, border:'none',
                      background:'transparent', fontSize:14, color:'var(--ink-3)',
                      cursor:'pointer', fontFamily:'var(--font-body)'}}
                  >
                    Cancel
                  </button>
                )}

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
