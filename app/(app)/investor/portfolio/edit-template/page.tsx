'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

const RETURN_LABEL: Record<string, string> = {
  fixed: 'Fixed returns', revenue_share: 'Revenue share', equity: 'Equity',
}

function EditTemplateInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const id           = searchParams.get('id') || ''

  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)
  const [deleting,      setDeleting]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error,         setError]         = useState('')
  const [saved,         setSaved]         = useState(false)

  const [editName,        setEditName]        = useState('')
  const [editAmount,      setEditAmount]      = useState('')
  const [editReturnType,  setEditReturnType]  = useState('fixed')
  const [editRoiPct,      setEditRoiPct]      = useState('')
  const [editRevPct,      setEditRevPct]      = useState('')
  const [editEqPct,       setEditEqPct]       = useState('')
  const [editTotal,       setEditTotal]       = useState('')
  const [editReporting,   setEditReporting]   = useState('monthly')
  const [editNotes,       setEditNotes]       = useState('')

  useEffect(() => {
    if (!id) return
    supabase.from('offers').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) {
        setEditName(data.template_name || '')
        setEditAmount(data.amount ? String(data.amount) : '')
        setEditReturnType(data.return_type || 'fixed')
        setEditRoiPct(data.return_rate != null ? String(data.return_rate) : '')
        setEditRevPct(data.revenue_percent != null ? String(data.revenue_percent) : '')
        setEditEqPct(data.equity_percent != null ? String(data.equity_percent) : '')
        setEditTotal(data.total_return_amount != null ? String(data.total_return_amount) : '')
        setEditReporting(data.reporting_frequency || 'monthly')
        setEditNotes(data.notes || '')
      }
      setLoading(false)
    })
  }, [id])

  async function handleSave() {
    if (!id) return
    setSaving(true)
    setError('')
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
    const { error: e } = await supabase.from('offers').update(payload).eq('id', id)
    setSaving(false)
    if (e) { setError(e.message || 'Could not save changes.'); return }
    setSaved(true)
    setTimeout(() => router.back(), 900)
  }

  async function handleDelete() {
    if (!id) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    setError('')
    const { error: e } = await supabase.from('offers').delete().eq('id', id)
    setDeleting(false)
    if (e) { setError(e.message || 'Could not delete template.'); return }
    router.back()
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
    fontSize: 15, color: 'var(--ink)', outline: 'none',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: 'var(--ink-2)',
    textTransform: 'uppercase', letterSpacing: 0.8,
    display: 'block', marginBottom: 6,
  }

  if (loading) return (
    <div className="app-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
    </div>
  )

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Edit template"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '20px 20px 40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Template name */}
          <div>
            <label style={labelStyle}>Template name</label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="e.g. Standard 20% ROI"
              style={fieldStyle}
            />
          </div>

          {/* Amount */}
          <div>
            <label style={labelStyle}>Amount (₦)</label>
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
              style={fieldStyle}
            />
          </div>

          {/* Return type */}
          <div>
            <label style={labelStyle}>Return type</label>
            <div style={{ position: 'relative' }}>
              <select
                value={editReturnType}
                onChange={e => setEditReturnType(e.target.value)}
                style={{ ...fieldStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 36 }}
              >
                {Object.entries(RETURN_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          {/* ROI % for fixed */}
          {editReturnType === 'fixed' && (
            <div>
              <label style={labelStyle}>ROI percent (%)</label>
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
                style={fieldStyle}
              />
            </div>
          )}

          {/* Revenue % */}
          {editReturnType === 'revenue_share' && (
            <div>
              <label style={labelStyle}>Revenue percent (%)</label>
              <input
                type="number"
                value={editRevPct}
                onChange={e => setEditRevPct(e.target.value)}
                placeholder="e.g. 15"
                style={fieldStyle}
              />
            </div>
          )}

          {/* Equity % */}
          {editReturnType === 'equity' && (
            <div>
              <label style={labelStyle}>Equity percent (%)</label>
              <input
                type="number"
                value={editEqPct}
                onChange={e => setEditEqPct(e.target.value)}
                placeholder="e.g. 5"
                style={fieldStyle}
              />
            </div>
          )}

          {/* Total return amount */}
          <div>
            <label style={labelStyle}>Total return amount (₦)</label>
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
              style={fieldStyle}
            />
          </div>

          {/* Reporting frequency */}
          <div>
            <label style={labelStyle}>Reporting frequency</label>
            <div style={{ position: 'relative' }}>
              <select
                value={editReporting}
                onChange={e => setEditReporting(e.target.value)}
                style={{ ...fieldStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 36 }}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              placeholder="Any additional terms or notes…"
              rows={3}
              style={{ ...fieldStyle, resize: 'vertical' }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7f1d1d' }}>
              {error}
            </div>
          )}
          {saved && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#065f46' }}>
              Saved! Going back…
            </div>
          )}

        </div>
      </div>

      <div style={{ padding: '12px 20px 32px', borderTop: '1px solid var(--line)', background: 'var(--cream)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="btn btn-forest btn-block"
          style={{ opacity: saving || saved ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            width: '100%', padding: '13px', borderRadius: 14,
            border: confirmDelete ? 'none' : '1.5px solid var(--clay)',
            background: confirmDelete ? 'var(--clay)' : 'transparent',
            color: confirmDelete ? '#fff' : 'var(--clay)',
            fontSize: 14, fontWeight: 600,
            cursor: deleting ? 'default' : 'pointer',
            fontFamily: 'var(--font-body)', opacity: deleting ? 0.7 : 1,
          }}
        >
          {deleting ? 'Deleting…' : confirmDelete ? 'Confirm delete' : 'Delete template'}
        </button>
        {confirmDelete && (
          <button onClick={() => setConfirmDelete(false)}
            style={{ width: '100%', padding: '10px', borderRadius: 14, border: 'none', background: 'transparent', fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default function EditTemplatePage() {
  return (
    <Suspense>
      <EditTemplateInner />
    </Suspense>
  )
}
