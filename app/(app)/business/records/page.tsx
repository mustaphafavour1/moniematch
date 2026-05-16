'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { getMyBusinessDocuments, uploadBusinessFile, addBusinessLink, deleteBusinessDocument } from '@/lib/db'

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

// ── Sub-components ────────────────────────────────────────────────────────────

function PillTabs<T extends string>({
  tabs, active, onSelect,
}: { tabs: { key: T; label: string }[]; active: T; onSelect: (k: T) => void }) {
  return (
    <div style={{
      display: 'flex', gap: 6, padding: '0 22px 14px',
      overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onSelect(t.key)} style={{
          flexShrink: 0,
          padding: '7px 16px',
          borderRadius: 999,
          border: '1.5px solid',
          borderColor: active === t.key ? 'var(--ink)' : 'var(--line-strong)',
          background: active === t.key ? 'var(--ink)' : 'transparent',
          color: active === t.key ? 'var(--cream)' : 'var(--ink-2)',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 150ms',
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

function ReportsTab() {
  const router = useRouter()
  return (
    <EmptyState
      icon="chart"
      title="No reports yet"
      body="Reports you create will appear here. Investors love receiving regular updates."
      action={
        <button
          onClick={() => router.push('/business/reporting')}
          className="btn btn-primary"
          style={{ fontSize: 14, padding: '12px 24px' }}
        >
          <Icon name="plus" size={16} color="var(--cream)" />
          Create report
        </button>
      }
    />
  )
}

// ── Document Row ──────────────────────────────────────────────────────────────

function DocRow({ doc }: { doc: BusinessDocument }) {
  const isLink = doc.item_type === 'link'
  const isPhoto = doc.doc_type === 'photo'
  const iconName = isLink ? 'link' : isPhoto ? 'photo' : 'doc'
  const label = isLink ? (doc.link_title || doc.file_name) : doc.file_name

  return (
    <button
      onClick={() => window.open(doc.file_url, '_blank', 'noopener,noreferrer')}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 22px', width: '100%',
        background: 'transparent', border: 'none',
        borderBottom: '1px solid var(--line)',
        cursor: 'pointer', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: isLink ? 'var(--sun-tint)' : isPhoto ? 'var(--clay-tint)' : 'var(--forest-tint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon
          name={iconName} size={18}
          color={isLink ? '#8B5E1A' : isPhoto ? 'var(--clay)' : 'var(--forest)'}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: 'var(--ink)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 3,
        }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{fmtDate(doc.uploaded_at)}</span>
          {doc.file_size != null && (
            <><span style={{ opacity: 0.5 }}>·</span><span>{fmtSize(doc.file_size)}</span></>
          )}
          {doc.is_verified && (
            <span className="chip forest" style={{ fontSize: 10, padding: '2px 7px' }}>
              <Icon name="check" size={9} color="var(--forest)" /> Verified
            </span>
          )}
        </div>
      </div>

      <Icon name="fwd" size={16} color="var(--ink-4)" />
    </button>
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
  docs, loading, onRefresh,
}: { docs: BusinessDocument[]; loading: boolean; onRefresh: () => void }) {
  const [sub, setSub] = useState<InfoSubTab>('all')

  const subTabs: { key: InfoSubTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'documents', label: 'Documents' },
    { key: 'media', label: 'Media' },
    { key: 'links', label: 'Links' },
  ]

  const filtered = filterDocs(docs, sub)

  const emptyMessages: Record<InfoSubTab, { title: string; body: string; icon: string }> = {
    all:       { icon: 'upload', title: 'No files yet',      body: 'Add documents, media, or links to share with investors.' },
    documents: { icon: 'doc',    title: 'No documents',      body: 'Upload your CAC certificate, bank statements, or other files.' },
    media:     { icon: 'photo',  title: 'No media',          body: 'Upload photos or videos that showcase your business.' },
    links:     { icon: 'link',   title: 'No links added',    body: 'Add links to your website, social profiles, or portfolio.' },
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <PillTabs tabs={subTabs} active={sub} onSelect={setSub} />

      {loading ? (
        <div>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState {...emptyMessages[sub]} />
      ) : (
        <div>
          {filtered.map(doc => <DocRow key={doc.id} doc={doc} />)}
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
    setSelectedFile(file)
    setError(null)
    if (file) {
      const isImage = file.type.startsWith('image/')
      setPreviewUrl(isImage ? URL.createObjectURL(file) : null)
    } else {
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
      await addBusinessLink(linkUrl.trim(), linkTitle.trim(), 'link')
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
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
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
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Upload document</span>
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
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Upload photo / media</span>
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

type TopTab = 'reports' | 'business-info'

export default function BizRecordsPage() {
  const [topTab, setTopTab] = useState<TopTab>('reports')
  const [docs, setDocs] = useState<BusinessDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const topTabs: { key: TopTab; label: string }[] = [
    { key: 'reports',       label: 'Reports' },
    { key: 'business-info', label: 'Business Info' },
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
        <div style={{ paddingTop: 14 }}>
          <PillTabs tabs={topTabs} active={topTab} onSelect={setTopTab} />
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {topTab === 'reports' ? (
            <div className="scroll" style={{ flex: 1 }}>
              <ReportsTab />
            </div>
          ) : (
            <div className="scroll" style={{ flex: 1, paddingBottom: 100 }}>
              <BusinessInfoTab docs={docs} loading={loading} onRefresh={loadDocs} />
            </div>
          )}
        </div>
      </div>

      {/* Floating + button — only on Business Info tab */}
      {topTab === 'business-info' && (
        <button
          onClick={() => setSheetOpen(true)}
          style={{
            position: 'fixed', bottom: 88, right: 22, zIndex: 30,
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
