'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'
import { relTime } from '@/lib/utils'

interface Report {
  id: string
  title: string
  content: string
  status: string
  created_at: string
}

export default function SendReportFromChatPage() {
  const router   = useRouter()
  const params   = useParams()
  const matchId  = params.matchId as string

  const [reports,  setReports]  = useState<Report[]>([])
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState<string | null>(null)
  const [uid,      setUid]      = useState('')
  const [bizId,    setBizId]    = useState('')
  const [error,    setError]    = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUid(user.id)
      supabase.from('businesses').select('id').eq('owner_id', user.id).single().then(({ data: biz }) => {
        if (!biz) return
        setBizId(biz.id)
        supabase
          .from('business_reports')
          .select('id, title, content, status, created_at')
          .eq('business_id', biz.id)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            setReports((data || []) as Report[])
            setLoading(false)
          })
      })
    })
  }, [])

  const handleSend = async (report: Report) => {
    if (sending) return
    setSending(report.id)
    setError('')
    try {
      if (!uid || !bizId) throw new Error('Not signed in')

      // Update report's match_id and status if not already sent
      await supabase.from('business_reports').update({ match_id: matchId, status: 'sent' }).eq('id', report.id)

      await supabase.from('messages').insert({
        id: crypto.randomUUID(),
        match_id: matchId,
        sender_id: uid,
        content: `📋 ${report.title}`,
        content_type: 'report',
        ref_id: report.id,
      })

      router.back()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setSending(null)
    }
  }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Send a report"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          Pick an existing report to send, or create a new one.
        </p>

        {error && <p style={{ fontSize: 13, color: 'var(--clay)', marginBottom: 12 }}>{error}</p>}

        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--ink-3)', fontSize: 13 }}>Loading…</div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)', fontSize: 14 }}>
            No reports yet. Create your first report below.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {reports.map(r => (
              <div key={r.id} style={{
                background: 'var(--bone)', border: '1px solid var(--line)',
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
                    {relTime(r.created_at)}
                    {r.status === 'draft' && (
                      <span style={{ marginLeft: 6, background: 'var(--linen)', borderRadius: 4,
                        padding: '1px 6px', fontSize: 10, color: 'var(--ink-3)', fontWeight: 600 }}>
                        Draft
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleSend(r)}
                  disabled={sending === r.id}
                  style={{
                    background: 'var(--forest)', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0,
                  }}>
                  {sending === r.id ? 'Sending…' : 'Send'}
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => router.push(`/business/records/new-report/write?matchId=${matchId}`)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '14px', borderRadius: 14,
            background: 'var(--bone)', border: '1.5px dashed var(--line-strong)',
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontSize: 14, fontWeight: 500, color: 'var(--ink-2)',
          }}>
          <Icon name="doc" size={16} color="var(--ink-3)" />
          Create new report
        </button>
      </div>
    </div>
  )
}
