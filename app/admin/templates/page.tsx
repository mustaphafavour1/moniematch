'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Template { id: string; name: string; category: string; body_html: string; is_active: boolean; created_at: string }

function prettifyDocxHtml(raw: string): string {
  let h = raw
  // Headings
  h = h.replace(/<h1>/gi, '<h1 style="font-size:20px;font-weight:800;margin:0 0 6px;text-align:center;font-family:Georgia,serif;">')
  h = h.replace(/<h2>/gi, '<h2 style="font-size:15px;font-weight:700;margin:22px 0 8px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:2px solid #111;padding-bottom:4px;">')
  h = h.replace(/<h3>/gi, '<h3 style="font-size:14px;font-weight:700;margin:18px 0 6px;">')
  // Paragraphs — space between
  h = h.replace(/<p>/gi, '<p style="margin:0 0 10px;line-height:1.85;font-size:14px;color:#111;">')
  // Empty paragraphs → visible spacer
  h = h.replace(/<p[^>]*>\s*<\/p>/gi, '<div style="height:10px"></div>')
  // Tables
  h = h.replace(/<table>/gi, '<table style="width:100%;border-collapse:collapse;margin:14px 0;font-size:13px;">')
  h = h.replace(/<td>/gi, '<td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">')
  h = h.replace(/<th>/gi, '<th style="padding:8px 12px;border:1px solid #d1d5db;background:#f3f4f6;font-weight:600;text-align:left;">')
  // HR
  h = h.replace(/<hr\s*\/?>/gi, '<hr style="border:none;border-top:1.5px solid #111;margin:18px 0;">')
  // Wrap in formal document container
  return `<div style="font-family:Georgia,serif;max-width:700px;margin:0 auto;padding:36px 28px;line-height:1.85;color:#111;background:#fff;">${h}</div>`
}

const CATEGORIES = ['investment', 'loan', 'equity', 'revenue_share', 'other']

export default function AdminTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates]     = useState<Template[]>([])
  const [loading, setLoading]         = useState(true)
  const [editing, setEditing]         = useState<Template | null>(null)
  const [creating, setCreating]       = useState(false)

  // Form state
  const [name, setName]               = useState('')
  const [category, setCategory]       = useState('investment')
  const [bodyHtml, setBodyHtml]       = useState('')
  const [saving, setSaving]           = useState(false)
  const [saveErr, setSaveErr]         = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [deleting, setDeleting]       = useState<string | null>(null)
  const [confirmDel, setConfirmDel]   = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('mm_admin')) {
      router.replace('/admin')
      return
    }
    loadTemplates()
  }, [])

  async function loadTemplates() {
    setLoading(true)
    const { data } = await supabase.from('contract_templates').select('*').order('created_at', { ascending: false })
    setTemplates((data as Template[]) || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setName(''); setCategory('investment'); setBodyHtml(''); setSaveErr(''); setPreviewMode(false)
    setCreating(true)
  }

  function openEdit(t: Template) {
    setCreating(false)
    setName(t.name); setCategory(t.category); setBodyHtml(t.body_html); setSaveErr(''); setPreviewMode(false)
    setEditing(t)
  }

  function closeForm() { setCreating(false); setEditing(null) }

  async function handleDocxUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const mammoth = (await import('mammoth')).default
      const ab = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer: ab })
      setBodyHtml(prettifyDocxHtml(result.value))
    } catch {
      setSaveErr('Could not convert file. Make sure it is a valid .docx file.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSave() {
    if (!name.trim()) { setSaveErr('Template name is required.'); return }
    if (!bodyHtml.trim()) { setSaveErr('Template body is required.'); return }
    setSaving(true); setSaveErr('')
    const placeholders = Array.from(bodyHtml.matchAll(/\{\{(\w+)\}\}/g)).map(m => m[1])
    const unique = placeholders.filter((v, i, a) => a.indexOf(v) === i)
    const payload = {
      ...(editing ? { id: editing.id } : {}),
      name: name.trim(), category, body_html: bodyHtml,
      placeholders: JSON.stringify(unique), is_active: true,
    }
    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'MonieMatchAdmin/2001' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setSaveErr(json.error || 'Could not save.'); return }
    closeForm()
    loadTemplates()
  }

  async function handleDelete(id: string) {
    if (confirmDel !== id) { setConfirmDel(id); return }
    setDeleting(id); setConfirmDel(null)
    await fetch('/api/admin/templates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'MonieMatchAdmin/2001' },
      body: JSON.stringify({ id }),
    })
    setDeleting(null)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  async function toggleActive(t: Template) {
    await fetch('/api/admin/templates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'MonieMatchAdmin/2001' },
      body: JSON.stringify({ id: t.id, is_active: !t.is_active }),
    })
    setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x))
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #d1d5db',
    background: '#f9fafb', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }

  const showForm = creating || editing !== null

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Contract Templates</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Manage agreement templates used in deals</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={openNew} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#111827', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              + New template
            </button>
            <button onClick={() => { sessionStorage.removeItem('mm_admin'); router.push('/admin') }}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, color: '#6b7280', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>

        {/* Placeholder guide */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
          <strong>Placeholder syntax:</strong> Use <code style={{ background: '#fef3c7', padding: '1px 5px', borderRadius: 4 }}>{'{{placeholder_name}}'}</code> anywhere in your template.
          Common ones: <code>{'{{investor_name}}'}</code> <code>{'{{business_name}}'}</code> <code>{'{{amount}}'}</code> <code>{'{{return_type}}'}</code> <code>{'{{roi_percent}}'}</code> <code>{'{{date}}'}</code> <code>{'{{biz_signature}}'}</code> <code>{'{{inv_signature}}'}</code> <code>{'{{biz_signed_date}}'}</code> <code>{'{{inv_signed_date}}'}</code>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>{editing ? 'Edit template' : 'New template'}</div>

            <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 2, minWidth: 220 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Template name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Revenue Share Agreement" style={inp} />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inp, appearance: 'none' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Upload DOCX file (optional — converts to HTML automatically)
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: '1.5px dashed #d1d5db', background: '#f9fafb', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
                {uploading ? 'Converting…' : '📄 Choose .docx file'}
                <input type="file" accept=".docx" onChange={handleDocxUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                PDF not supported — export to DOCX from Word or Google Docs first, then upload.
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>HTML body</label>
                <button onClick={() => setPreviewMode(p => !p)} style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {previewMode ? 'Edit HTML' : 'Preview'}
                </button>
              </div>
              {previewMode ? (
                <div style={{ border: '1.5px solid #d1d5db', borderRadius: 10, padding: '16px 20px', minHeight: 300, background: '#fff', fontSize: 14, lineHeight: 1.7, overflowY: 'auto', maxHeight: 500 }}
                  dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              ) : (
                <textarea
                  value={bodyHtml}
                  onChange={e => setBodyHtml(e.target.value)}
                  placeholder={'<h1>Investment Agreement</h1>\n<p>This agreement is between {{investor_name}} and {{business_name}}...</p>'}
                  style={{ ...inp, minHeight: 320, resize: 'vertical', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5 }}
                />
              )}
            </div>

            {saveErr && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#7f1d1d', marginBottom: 12 }}>
                {saveErr}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: saving ? '#9ca3af' : '#111827', color: '#fff', fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer' }}>
                {saving ? 'Saving…' : 'Save template'}
              </button>
              <button onClick={closeForm} style={{ padding: '12px 18px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, color: '#6b7280', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Template list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>Loading…</div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>No templates yet. Create your first one above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {templates.map(t => (
              <div key={t.id} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
                    {t.category.replace('_', ' ')} · {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: t.is_active ? '#dcfce7' : '#f3f4f6', color: t.is_active ? '#166534' : '#6b7280', fontWeight: 500 }}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => toggleActive(t)} style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#6b7280', cursor: 'pointer' }}>
                    {t.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => openEdit(t)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 8, border: 'none', background: confirmDel === t.id ? '#dc2626' : '#fee2e2', color: confirmDel === t.id ? '#fff' : '#dc2626', cursor: 'pointer' }}>
                    {deleting === t.id ? '…' : confirmDel === t.id ? 'Confirm delete' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
