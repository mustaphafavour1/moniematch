'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { getMyBusinessDocuments, uploadBusinessFile, addBusinessLink, deleteBusinessDocument, uploadBusinessBanner } from '@/lib/db'
import { supabase } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BusinessDocument {
  id: string; business_id: string; uploader_id: string; doc_type: string
  item_type: 'file' | 'link'; file_name: string; file_url: string
  storage_path?: string; file_size?: number; link_title?: string
  is_verified: boolean; uploaded_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? (bytes / 1024).toFixed(0) + 'KB'
    : (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function printReport(title: string, createdAt: string, content: string) {
  const w = window.open('', '_blank')
  if (!w) return
  const date = fmtDate(createdAt)
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
    body{font-family:Georgia,serif;max-width:680px;margin:48px auto;color:#1a1a1a;line-height:1.6}
    h1{font-size:22px;margin-bottom:4px}
    .date{font-size:12px;color:#888;margin-bottom:28px}
    pre{white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.7}
  </style></head><body>
    <h1>${title}</h1><div class="date">${date}</div>
    <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </body></html>`)
  w.document.close()
  w.focus()
  w.print()
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Line-underline tabs for top level
function LineTabs<T extends string>({
  tabs, active, onSelect,
}: { tabs: { key: T; label: string }[]; active: T; onSelect: (k: T) => void }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1.5px solid var(--line)', overflowX: 'auto', scrollbarWidth: 'none' }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onSelect(t.key)} style={{
          flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active === t.key ? 700 : 500,
          color: active === t.key ? 'var(--ink)' : 'var(--ink-3)',
          borderBottom: active === t.key ? '2.5px solid var(--forest)' : '2.5px solid transparent',
          marginBottom: -1.5, transition: 'all 150ms', whiteSpace: 'nowrap',
        }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// Pill tabs for sub-level (inside Business Info)
function PillTabs<T extends string>({
  tabs, active, onSelect, style,
}: { tabs: { key: T; label: string }[]; active: T; onSelect: (k: T) => void; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', flex: 1, ...style }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onSelect(t.key)} style={{
          flexShrink: 0, padding: '7px 16px', borderRadius: 999, border: '1.5px solid',
          borderColor: active === t.key ? 'var(--ink)' : 'var(--line-strong)',
          background: active === t.key ? 'var(--ink)' : 'transparent',
          color: active === t.key ? 'var(--cream)' : 'var(--ink-2)',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'all 150ms',
        }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 22px', borderBottom: '1px solid var(--line)',
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--linen)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 13, width: '55%', borderRadius: 6, background: 'var(--linen)', marginBottom: 7 }} />
        <div style={{ height: 11, width: '35%', borderRadius: 6, background: 'var(--linen)' }} />
      </div>
    </div>
  )
}

function EmptyState({ icon, title, body, action }: {
  icon: string; title: string; body: string; action?: React.ReactNode
}) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 32px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--linen)', border: '1.5px solid var(--line-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Icon name={icon} size={24} color="var(--ink-3)" />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
        {title}
      </div>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 20 }}>{body}</p>
      {action}
    </div>
  )
}

// ── Reports Tab ───────────────────────────────────────────────────────────────

interface BizReport {
  id: string; business_id: string; match_id?: string; template?: string
  title?: string; content?: string; status?: string; created_at: string
}

function ReportsTab() {
  const router = useRouter()
  const [reports, setReports]     = useState<BizReport[]>([])
  const [loading, setLoading]     = useState(true)
  const [viewing, setViewing]     = useState<BizReport | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()
      if (!biz) { setLoading(false); return }
      const { data } = await supabase.from('business_reports').select('*')
        .eq('business_id', biz.id).order('created_at', { ascending: false })
      setReports((data as BizReport[]) || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div><SkeletonRow /><SkeletonRow /></div>

  if (reports.length === 0) return (
    <EmptyState icon="doc" title="No reports yet"
      body="Reports you create will appear here. Investors love receiving regular updates."
      action={
        <button onClick={() => router.push('/business/records/new-report')} className="btn btn-primary" style={{ fontSize: 14, padding: '12px 24px' }}>
          Create report
        </button>
      }
    />
  )

  return (
    <>
      <div style={{ padding: '12px 22px 4px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => router.push('/business/records/new-report')}
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--forest)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          + New report
        </button>
      </div>
      {reports.map(r => (
        <button key={r.id} onClick={() => setViewing(r)} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 22px', width: '100%', background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--line)', cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'var(--linen)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="doc" size={18} color="var(--forest)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
              {r.title || 'Untitled report'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>{fmtDate(r.created_at)}</span>
              {r.status && (
                <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10.5, fontWeight: 600,
                  background: r.status === 'sent' ? 'var(--forest-tint)' : 'var(--linen)',
                  color: r.status === 'sent' ? 'var(--forest)' : 'var(--ink-3)' }}>
                  {r.status === 'sent' ? 'Sent' : 'Draft'}
                </span>
              )}
            </div>
          </div>
          <Icon name="fwd" size={14} color="var(--ink-4)" />
        </button>
      ))}

      {/* View report overlay */}
      {viewing && (
        <>
          <div onClick={() => setViewing(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(31,26,20,0.45)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 390, zIndex: 101,
            background: 'var(--cream)', borderRadius: '20px 20px 0 0',
            padding: '0 0 env(safe-area-inset-bottom,32px)',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 -4px 32px rgba(31,26,20,0.16)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--line-strong)' }} />
            </div>
            <div style={{ padding: '0 22px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>
                {viewing.title || 'Report'}
              </span>
              <button onClick={() => printReport(viewing.title || 'Report', viewing.created_at, viewing.content || '')} style={{ background: 'none', border: '1px solid var(--line-strong)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Print / PDF
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 24px' }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 12 }}>{fmtDate(viewing.created_at)}</div>
              <pre style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
                {viewing.content || 'No content'}
              </pre>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Document Row ──────────────────────────────────────────────────────────────

function DocRow({ doc, onDeleted }: { doc: BusinessDocument; onDeleted: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const [menuOpen, setMenuOpen]           = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isLink  = doc.item_type === 'link'
  const isPhoto = doc.doc_type === 'photo'
  const iconName = isLink ? 'link' : isPhoto ? 'photo' : 'doc'
  const label    = doc.file_name

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  async function getFileUrl(): Promise<string> {
    if (isLink || isPhoto || !doc.storage_path) return doc.file_url
    const bucket = doc.doc_type === 'bank_statement' ? 'deal-files' : 'documents'
    const { data } = await supabase.storage.from(bucket).createSignedUrl(doc.storage_path, 3600)
    return data?.signedUrl || doc.file_url
  }

  async function openDoc() {
    window.open(await getFileUrl(), '_blank', 'noopener,noreferrer')
  }

  async function downloadFile() {
    const url = await getFileUrl()
    const a = document.createElement('a')
    a.href = url
    a.download = doc.file_name
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setMenuOpen(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteBusinessDocument(doc.id)
      if (doc.storage_path) {
        const bucket = doc.doc_type === 'photo' ? 'business-photos' : doc.doc_type === 'bank_statement' ? 'deal-files' : 'documents'
        await supabase.storage.from(bucket).remove([doc.storage_path])
      }
      onDeleted()
    } finally { setDeleting(false); setConfirmDelete(false) }
  }

  const menuActions = [
    { label: 'Open file',    action: () => { openDoc(); setMenuOpen(false) } },
    { label: 'Download',     action: downloadFile },
    { label: 'Delete',       action: () => { setMenuOpen(false); setConfirmDelete(true) }, danger: true },
  ]

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
        <button onClick={openDoc} style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 12,
          padding: '13px 0 13px 22px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left', WebkitTapHighlightColor: 'transparent',
          minWidth: 0,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: isLink ? 'var(--sun-tint)' : isPhoto ? 'var(--clay-tint)' : 'var(--forest-tint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={iconName} size={18} color={isLink ? '#8B5E1A' : isPhoto ? 'var(--clay)' : 'var(--forest)'} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3, maxWidth: '100%' }}>
              {label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{fmtDate(doc.uploaded_at)}</span>
              {doc.file_size != null && <><span style={{ opacity: 0.5 }}>·</span><span>{fmtSize(doc.file_size)}</span></>}
              {doc.is_verified && <span style={{ padding: '2px 6px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: 'var(--forest-tint)', color: 'var(--forest)' }}>Verified</span>}
            </div>
          </div>
        </button>

        {/* 3-dot menu */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setMenuOpen(v => !v)} style={{
            padding: '0 16px 0 8px', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}>
            <Icon name="more" size={16} color="var(--ink-4)" />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 8, top: '110%', zIndex: 200,
              background: 'var(--cream)', border: '1px solid var(--line)',
              borderRadius: 12, boxShadow: 'var(--shadow-md)', minWidth: 150, overflow: 'hidden',
            }}>
              {menuActions.map((item, i) => (
                <button key={item.label} onClick={item.action} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px 16px', background: 'none', border: 'none',
                  borderTop: i > 0 ? '1px solid var(--line)' : 'none',
                  fontSize: 14, color: item.danger ? '#C0392B' : 'var(--ink)',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <>
          <div onClick={() => setConfirmDelete(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(31,26,20,0.45)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 390, zIndex: 101,
            background: 'var(--cream)', borderRadius: '20px 20px 0 0',
            padding: '24px 22px env(safe-area-inset-bottom,32px)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--ink)', marginBottom: 8 }}>Delete file?</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.5 }}>
              "{label}" will be permanently removed. This cannot be undone.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleDelete} disabled={deleting}
                style={{ padding: '14px', borderRadius: 12, border: 'none', background: '#C0392B', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                style={{ padding: '14px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--bone)', fontSize: 15, color: 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// ── Banner Upload ─────────────────────────────────────────────────────────────

function BannerSection() {
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('businesses').select('banner_url').eq('owner_id', user.id).maybeSingle()
      if (data?.banner_url) setBannerUrl(data.banner_url)
    })
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('File too large. Max 5MB.'); return }
    setUploading(true)
    setError('')
    try {
      const url = await uploadBusinessBanner(file)
      setBannerUrl(url)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ padding: '16px 22px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <div className="eyebrow">Business banner</div>
        {bannerUrl && !uploading && (
          <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--forest)', fontFamily: 'var(--font-body)' }}>
            Change
          </button>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 10 }}>
        Ideal size: 1200 × 630 px (2:1 ratio) · Max 5 MB
      </div>
      {bannerUrl ? (
        <img src={bannerUrl} alt="Banner" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 14, display: 'block' }} />
      ) : (
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
          width: '100%', height: 130, borderRadius: 14, border: '1.5px dashed var(--line-strong)',
          background: 'var(--bone)', display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 8, cursor: 'pointer',
        }}>
          {uploading
            ? <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Uploading…</span>
            : <>
                <Icon name="photo" size={24} color="var(--ink-3)" />
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Upload banner image</span>
              </>
          }
        </button>
      )}
      {uploading && bannerUrl ? (
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>Uploading…</div>
      ) : null}
      {error ? <div style={{ fontSize: 12, color: 'var(--clay)', marginTop: 8 }}>{error}</div> : null}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
      <div style={{ height: 16 }} />
    </div>
  )
}

// ── Business Info Tab ─────────────────────────────────────────────────────────

type InfoSubTab = 'all' | 'documents' | 'media' | 'links'

const DOC_TYPES = ['cac', 'bank_statement', 'other']

function filterDocs(docs: BusinessDocument[], sub: InfoSubTab): BusinessDocument[] {
  if (sub === 'all') return docs
  if (sub === 'documents') return docs.filter(d => d.item_type === 'file' && DOC_TYPES.includes(d.doc_type))
  if (sub === 'media') return docs.filter(d => d.item_type === 'file' && d.doc_type === 'photo')
  if (sub === 'links') return docs.filter(d => d.item_type === 'link')
  return docs
}

function BusinessInfoTab({
  docs, loading, onRefresh, onAdd,
}: { docs: BusinessDocument[]; loading: boolean; onRefresh: () => void; onAdd: () => void }) {
  const [sub, setSub] = useState<InfoSubTab>('all')

  const subTabs: { key: InfoSubTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'documents', label: 'Documents' },
    { key: 'media', label: 'Media' },
    { key: 'links', label: 'Links' },
  ]

  const filtered = filterDocs(docs, sub)

  const emptyMessages: Record<InfoSubTab, { title: string; body: string; icon: string }> = {
    all:       { icon: 'upload', title: 'No files yet',   body: 'Add documents, media, or links to share with investors.' },
    documents: { icon: 'doc',    title: 'No documents',   body: 'Upload your CAC certificate, bank statements, or other files.' },
    media:     { icon: 'photo',  title: 'No media',       body: 'Upload photos or videos that showcase your business.' },
    links:     { icon: 'link',   title: 'No links added', body: 'Add links to your website, social profiles, or portfolio.' },
  }

  const addBtn = (
    <button onClick={onAdd} className="btn btn-primary" style={{ fontSize: 14, padding: '12px 24px' }}>
      Add item
    </button>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <BannerSection />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px 14px' }}>
        <PillTabs tabs={subTabs} active={sub} onSelect={setSub} />
        <button onClick={onAdd} style={{
          flexShrink: 0, width: 36, height: 36, borderRadius: 999,
          background: 'var(--ink)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="plus" size={18} color="var(--cream)" />
        </button>
      </div>

      {loading ? (
        <div>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState {...emptyMessages[sub]} action={addBtn} />
      ) : (
        <div>
          {filtered.map(doc => <DocRow key={doc.id} doc={doc} onDeleted={onRefresh} />)}
        </div>
      )}
    </div>
  )
}

// ── Add Item Bottom Sheet ─────────────────────────────────────────────────────

type Sheet = 'menu' | 'upload-doc' | 'upload-media' | 'add-link'

const DOC_TYPE_OPTIONS = [
  { value: 'cac',           label: 'CAC Certificate' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'other',         label: 'Other document' },
]

function BottomSheet({
  open, onClose, onRefresh,
}: { open: boolean; onClose: () => void; onRefresh: () => void }) {
  const [sheet, setSheet] = useState<Sheet>('menu')
  const [docType, setDocType] = useState('cac')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSheet('menu')
        setSelectedFile(null)
        setPreviewUrl(null)
        setLinkTitle('')
        setLinkUrl('')
        setSaving(false)
        setError(null)
        setDocType('cac')
      }, 280)
    }
  }, [open])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setError(null)
    if (file) {
      const isPhoto = sheet === 'upload-media'
      const maxBytes = isPhoto ? 10 * 1024 * 1024 : 2 * 1024 * 1024
      if (file.size > maxBytes) {
        const maxMB = isPhoto ? '10MB' : '2MB'
        setError(`File too large (max ${maxMB}). Try compressing it at tinypng.com / ilovepdf.com, or upload to Google Drive and add the link instead.`)
        setSelectedFile(null)
        setPreviewUrl(null)
        return
      }
      setSelectedFile(file)
      const isImage = file.type.startsWith('image/')
      setPreviewUrl(isImage ? URL.createObjectURL(file) : null)
    } else {
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }

  async function handleUploadDoc() {
    if (!selectedFile) { setError('Please select a file.'); return }
    setSaving(true); setError(null)
    try {
      await uploadBusinessFile(selectedFile, docType)
      onRefresh(); onClose()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUploadMedia() {
    if (!selectedFile) { setError('Please select a file.'); return }
    setSaving(true); setError(null)
    try {
      await uploadBusinessFile(selectedFile, 'photo')
      onRefresh(); onClose()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddLink() {
    if (!linkTitle.trim()) { setError('Please enter a title.'); return }
    if (!linkUrl.trim()) { setError('Please enter a URL.'); return }
    setSaving(true); setError(null)
    try {
      await addBusinessLink(linkUrl.trim(), linkTitle.trim(), 'other')
      onRefresh(); onClose()
    } catch {
      setError('Could not save link. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(31,26,20,0.45)',
          animation: 'fadein 200ms ease both',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', bottom: 0, left: 'max(0px, calc(50vw - 195px))', right: 'max(0px, calc(50vw - 195px))', zIndex: 50,
        background: 'var(--cream)',
        borderRadius: '20px 20px 0 0',
        padding: '0 0 env(safe-area-inset-bottom, 24px)',
        boxShadow: '0 -4px 32px rgba(31,26,20,0.16)',
        animation: 'sheet-up 260ms cubic-bezier(0.32,0.72,0,1) both',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--line-strong)' }} />
        </div>

        {/* ── Menu ── */}
        {sheet === 'menu' && (
          <div style={{ padding: '8px 0 8px' }}>
            <div style={{ padding: '0 22px 12px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>
              Add new item
            </div>
            {[
              { icon: 'doc',   label: 'Upload document', sub: 'upload-doc'   as Sheet },
              { icon: 'photo', label: 'Upload photo / media', sub: 'upload-media' as Sheet },
              { icon: 'link',  label: 'Add link',        sub: 'add-link'     as Sheet },
            ].map(opt => (
              <button key={opt.sub} onClick={() => setSheet(opt.sub)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 22px', width: '100%',
                background: 'transparent', border: 'none',
                borderTop: '1px solid var(--line)', cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'var(--linen)', border: '1.5px solid var(--line-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={opt.icon} size={19} color="var(--ink-2)" />
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{opt.label}</span>
                <Icon name="fwd" size={16} color="var(--ink-4)" style={{ marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        )}

        {/* ── Upload Document ── */}
        {sheet === 'upload-doc' && (
          <div style={{ padding: '8px 22px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setSheet('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <Icon name="back" size={20} color="var(--ink-2)" />
              </button>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Upload document</span>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>Max file size: 2MB</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Document type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DOC_TYPE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setDocType(opt.value)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 12,
                    border: '1.5px solid', borderColor: docType === opt.value ? 'var(--ink)' : 'var(--line-strong)',
                    background: docType === opt.value ? 'var(--ink)' : 'var(--bone)',
                    color: docType === opt.value ? 'var(--cream)' : 'var(--ink)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}>
                    {opt.label}
                    {docType === opt.value && <Icon name="check" size={15} color="var(--cream)" />}
                  </button>
                ))}
              </div>
            </div>

            <input
              ref={fileInputRef} type="file" accept="*/*"
              onChange={handleFileChange} style={{ display: 'none' }}
            />

            {selectedFile ? (
              <div style={{
                padding: '14px', borderRadius: 12,
                border: '1.5px solid var(--line-strong)',
                background: 'var(--bone)',
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 16,
              }}>
                <Icon name="doc" size={20} color="var(--ink-2)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{fmtSize(selectedFile.size)}</div>
                </div>
                <button onClick={() => { setSelectedFile(null); setPreviewUrl(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Icon name="close" size={15} color="var(--ink-3)" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} style={{
                width: '100%', padding: '18px', borderRadius: 12, marginBottom: 16,
                border: '1.5px dashed var(--line-strong)', background: 'var(--bone)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer',
              }}>
                <Icon name="upload" size={22} color="var(--ink-3)" />
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Tap to select file</span>
              </button>
            )}

            {error && <div style={{ fontSize: 12, color: 'var(--clay)', marginBottom: 12 }}>{error}</div>}

            <button
              onClick={handleUploadDoc} disabled={!selectedFile || saving}
              className="btn btn-primary btn-block"
            >
              {saving ? 'Uploading…' : 'Upload document'}
            </button>
          </div>
        )}

        {/* ── Upload Media ── */}
        {sheet === 'upload-media' && (
          <div style={{ padding: '8px 22px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setSheet('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <Icon name="back" size={20} color="var(--ink-2)" />
              </button>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Upload photo / media</span>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>Max file size: 10MB</div>
              </div>
            </div>

            <input
              ref={fileInputRef} type="file" accept="image/*,video/*"
              onChange={handleFileChange} style={{ display: 'none' }}
            />

            {previewUrl ? (
              <div style={{ marginBottom: 16, position: 'relative' }}>
                <img src={previewUrl} alt="Preview" style={{
                  width: '100%', height: 180, objectFit: 'cover',
                  borderRadius: 12, display: 'block',
                }} />
                <button onClick={() => { setSelectedFile(null); setPreviewUrl(null) }}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 28, height: 28, borderRadius: 999,
                    background: 'rgba(31,26,20,0.6)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                  <Icon name="close" size={13} color="#fff" />
                </button>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
                  {selectedFile?.name} · {selectedFile && fmtSize(selectedFile.size)}
                </div>
              </div>
            ) : selectedFile ? (
              <div style={{
                padding: '14px', borderRadius: 12,
                border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
              }}>
                <Icon name="photo" size={20} color="var(--ink-2)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{fmtSize(selectedFile.size)}</div>
                </div>
                <button onClick={() => { setSelectedFile(null); setPreviewUrl(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Icon name="close" size={15} color="var(--ink-3)" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} style={{
                width: '100%', padding: '36px 18px', borderRadius: 12, marginBottom: 16,
                border: '1.5px dashed var(--line-strong)', background: 'var(--bone)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer',
              }}>
                <Icon name="photo" size={28} color="var(--ink-3)" />
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Tap to select image or video</span>
              </button>
            )}

            {error && <div style={{ fontSize: 12, color: 'var(--clay)', marginBottom: 12 }}>{error}</div>}

            <button
              onClick={handleUploadMedia} disabled={!selectedFile || saving}
              className="btn btn-primary btn-block"
            >
              {saving ? 'Uploading…' : 'Upload media'}
            </button>
          </div>
        )}

        {/* ── Add Link ── */}
        {sheet === 'add-link' && (
          <div style={{ padding: '8px 22px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setSheet('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <Icon name="back" size={20} color="var(--ink-2)" />
              </button>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Add link</span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Title</div>
              <input
                type="text" value={linkTitle} onChange={e => setLinkTitle(e.target.value)}
                placeholder="e.g. Business website"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
                  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>URL</div>
              <input
                type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
                  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
                  outline: 'none',
                }}
              />
            </div>

            {error && <div style={{ fontSize: 12, color: 'var(--clay)', marginBottom: 12 }}>{error}</div>}

            <button
              onClick={handleAddLink} disabled={saving}
              className="btn btn-primary btn-block"
            >
              {saving ? 'Saving…' : 'Save link'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type TopTab = 'reports' | 'business-info' | 'offers'

interface OfferRow {
  id: string; match_id: string; amount: number; return_type?: string
  total_return_amount?: number; roi_percent?: number; equity_percent?: number
  revenue_percent?: number; status?: string; created_at: string
  matches?: { investors?: { users?: { name?: string } } }
}

function OffersTab() {
  const router = useRouter()
  const [offers, setOffers]   = useState<OfferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<OfferRow | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single()
      if (!biz) { setLoading(false); return }
      const { data: ms } = await supabase.from('matches').select('id').eq('business_id', biz.id)
      const matchIds = (ms || []).map(m => m.id)
      if (matchIds.length === 0) { setLoading(false); return }
      const { data } = await supabase.from('offers')
        .select('*, matches(investors(users(name)))')
        .in('match_id', matchIds)
        .order('created_at', { ascending: false })
      setOffers((data as OfferRow[]) || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div><SkeletonRow /><SkeletonRow /></div>
  if (offers.length === 0) return (
    <EmptyState icon="money" title="No offers yet"
      body="Offers from investors will appear here once they start making them." />
  )

  const fmtN = (n: number) => '₦' + n.toLocaleString()

  return (
    <>
      {offers.map(o => {
        const inv = (o.matches as unknown as { investors?: { users?: { name?: string } } } | null | undefined)?.investors
        const invName = inv?.users?.name || 'An investor'
        const returnSummary = o.return_type === 'equity'
          ? `${o.equity_percent}% equity`
          : o.return_type === 'revenue_share'
          ? `${o.revenue_percent}% revenue share`
          : o.total_return_amount
          ? `${fmtN(o.total_return_amount)} total return`
          : o.return_type || ''
        return (
          <button key={o.id} onClick={() => setViewing(o)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 22px', width: '100%', background: 'transparent', border: 'none',
            borderBottom: '1px solid var(--line)', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'var(--linen)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="money" size={18} color="var(--forest)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>
                {fmtN(o.amount)} from {invName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 8 }}>
                <span>{returnSummary}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{fmtDate(o.created_at)}</span>
              </div>
            </div>
            <Icon name="fwd" size={14} color="var(--ink-4)" />
          </button>
        )
      })}

      {viewing && (
        <>
          <div onClick={() => setViewing(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(31,26,20,0.45)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 390, zIndex: 101,
            background: 'var(--cream)', borderRadius: '20px 20px 0 0',
            padding: '0 0 env(safe-area-inset-bottom,32px)',
            maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--line-strong)' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 24px' }}>
              {(() => {
                const inv = (viewing.matches as unknown as { investors?: { users?: { name?: string } } } | null)?.investors
                const invName = inv?.users?.name || 'An investor'
                return (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginBottom: 4 }}>Offer details</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 20 }}>{fmtDate(viewing.created_at)}</div>
                    {[
                      ['From', invName],
                      ['Offer amount', fmtN(viewing.amount)],
                      ['Return type', viewing.return_type?.replace('_', ' ') || '—'],
                      viewing.total_return_amount ? ['Total return', fmtN(viewing.total_return_amount)] : null,
                      viewing.roi_percent ? ['ROI', `${viewing.roi_percent}%`] : null,
                      viewing.equity_percent ? ['Equity stake', `${viewing.equity_percent}%`] : null,
                      viewing.revenue_percent ? ['Revenue share', `${viewing.revenue_percent}%`] : null,
                    ].filter((r): r is string[] => r !== null).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
                        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{k}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                      <button onClick={() => router.push(`/business/chat/${viewing!.match_id}/offer-view?offerId=${viewing!.id}&mode=view`)}
                        className="btn btn-forest btn-block">
                        View full offer
                      </button>
                      <button onClick={() => router.push(`/business/chat/${viewing!.match_id}/offer-view?offerId=${viewing!.id}&mode=counter`)}
                        style={{ padding: '13px', borderRadius: 12, border: '1px solid var(--line-strong)',
                          background: 'var(--bone)', fontSize: 14, color: 'var(--ink)', cursor: 'pointer',
                          fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                        Counter offer
                      </button>
                      <button onClick={() => router.push(`/business/chat/${viewing!.match_id}`)}
                        style={{ padding: '13px', borderRadius: 12, border: 'none',
                          background: 'transparent', fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer',
                          fontFamily: 'var(--font-body)' }}>
                        Open conversation
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default function BizRecordsPage() {
  const router = useRouter()
  const [topTab, setTopTab] = useState<TopTab>('reports')
  const [docs, setDocs] = useState<BusinessDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const topTabs: { key: TopTab; label: string }[] = [
    { key: 'reports',       label: 'Reports' },
    { key: 'business-info', label: 'Business Info' },
    { key: 'offers',        label: 'Offers' },
  ]

  async function loadDocs() {
    setLoading(true)
    try {
      const data = await getMyBusinessDocuments()
      setDocs(data as BusinessDocument[])
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDocs() }, [])

  return (
    <>
      <div className="app-screen">
        <div className="statusbar-spacer" />
        <AppHeader title="Records" sticky />

        {/* Top-level tabs */}
        <div style={{ padding: '14px 22px 0' }}>
          <LineTabs tabs={topTabs} active={topTab} onSelect={setTopTab} />
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {topTab === 'reports' ? (
            <div className="scroll" style={{ flex: 1 }}>
              <ReportsTab />
            </div>
          ) : topTab === 'offers' ? (
            <div className="scroll" style={{ flex: 1 }}>
              <OffersTab />
            </div>
          ) : (
            <div className="scroll" style={{ flex: 1, paddingBottom: 100 }}>
              <div style={{ paddingTop: 16 }}>
                <BusinessInfoTab docs={docs} loading={loading} onRefresh={loadDocs} onAdd={() => setSheetOpen(true)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating + button — Reports tab */}
      {topTab === 'reports' && (
        <button
          onClick={() => router.push('/business/records/new-report')}
          style={{
            position: 'fixed', bottom: 88, right: 'calc(max(0px, 50vw - 195px) + 22px)', zIndex: 30,
            width: 52, height: 52, borderRadius: 999,
            background: 'var(--forest)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(31,26,20,0.28)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="plus" size={22} color="#fff" />
        </button>
      )}

      {/* Floating + button — Business Info tab */}
      {topTab === 'business-info' && (
        <button
          onClick={() => setSheetOpen(true)}
          style={{
            position: 'fixed', bottom: 88, right: 'calc(max(0px, 50vw - 195px) + 22px)', zIndex: 30,
            width: 52, height: 52, borderRadius: 999,
            background: 'var(--ink)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(31,26,20,0.28)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="plus" size={22} color="var(--cream)" />
        </button>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onRefresh={loadDocs}
      />
    </>
  )
}
