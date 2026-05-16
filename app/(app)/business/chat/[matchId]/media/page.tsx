'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getBusinessDocumentsForMatch } from '@/lib/db'
import type { BusinessDocument } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

type Tab = 'all' | 'documents' | 'media' | 'links'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'documents', label: 'Documents' },
  { key: 'media',     label: 'Media'     },
  { key: 'links',     label: 'Links'     },
]

function fmtSize(bytes: number) {
  return bytes < 1024 * 1024
    ? (bytes / 1024).toFixed(0) + 'KB'
    : (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function filterDocs(docs: BusinessDocument[], tab: Tab) {
  if (tab === 'all')       return docs
  if (tab === 'documents') return docs.filter(d => ['cac', 'bank_statement', 'other'].includes(d.doc_type) && d.item_type === 'file')
  if (tab === 'media')     return docs.filter(d => d.doc_type === 'photo' && d.item_type === 'file')
  if (tab === 'links')     return docs.filter(d => d.item_type === 'link')
  return docs
}

function docIcon(doc: BusinessDocument): string {
  if (doc.item_type === 'link')    return 'link'
  if (doc.doc_type === 'photo')    return 'photo'
  return 'doc'
}

export default function BizMediaPage() {
  const router  = useRouter()
  const params  = useParams()
  const matchId = params.matchId as string

  const [docs,    setDocs]    = useState<BusinessDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<Tab>('all')

  useEffect(() => {
    getBusinessDocumentsForMatch(matchId).then(data => {
      setDocs(data)
      setLoading(false)
    })
  }, [matchId])

  const visible = filterDocs(docs, tab)

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Shared documents"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6, padding: '10px 16px 0',
        borderBottom: '1px solid var(--line)', background: 'var(--cream)',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
              background: tab === t.key ? 'var(--ink)' : 'transparent',
              color: tab === t.key ? 'var(--cream)' : 'var(--ink-3)',
              marginBottom: -1, transition: 'all 180ms',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="scroll" style={{ flex: 1, padding: '12px 16px 32px' }}>
        {loading ? (
          /* Skeleton */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'var(--bone)', border: '1px solid var(--line)',
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--linen)' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 12, width: '60%', borderRadius: 6, background: 'var(--linen)' }} />
                  <div style={{ height: 10, width: '35%', borderRadius: 6, background: 'var(--linen)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <Icon name="doc" size={36} color="var(--ink-4)" />
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 14 }}>
              No {tab === 'all' ? 'files' : tab} uploaded yet
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.map(doc => (
              <div
                key={doc.id}
                onClick={() => window.open(doc.file_url, '_blank')}
                style={{
                  background: 'var(--bone)', border: '1px solid var(--line)',
                  borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'border-color 150ms',
                }}
              >
                {/* Icon box */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'var(--linen)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={docIcon(doc)} size={18} color="var(--ink-2)" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.item_type === 'link' ? (doc.link_title || doc.file_url) : doc.file_name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '3px 0 0', display: 'flex', gap: 8 }}>
                    <span>{fmtDate(doc.uploaded_at)}</span>
                    {doc.file_size && doc.item_type === 'file' && (
                      <span>· {fmtSize(doc.file_size)}</span>
                    )}
                  </p>
                </div>

                {/* Verified chip */}
                {doc.is_verified && (
                  <div style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
                    background: 'var(--linen)', borderRadius: 999, padding: '3px 8px',
                  }}>
                    <Icon name="check" size={11} color="var(--ink)" />
                    <span style={{ fontSize: 11, color: 'var(--ink)', fontWeight: 600 }}>Verified</span>
                  </div>
                )}

                <Icon name="fwd" size={14} color="var(--ink-4)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
