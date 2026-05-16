'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

interface Match { id: string; name: string }

export default function MediaReportPage() {
  const router = useRouter()
  const params = useSearchParams()
  const preselectedMatch = params.get('matchId') || ''

  const [matches,       setMatches]       = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState(preselectedMatch)
  const [caption,       setCaption]       = useState('')
  const [files,         setFiles]         = useState<File[]>([])
  const [uploading,     setUploading]     = useState(false)
  const [done,          setDone]          = useState(false)
  const [error,         setError]         = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('businesses').select('id').eq('owner_id', user.id).single().then(({ data: biz }) => {
        if (!biz) return
        supabase.from('matches').select('id, investors(users(name))').eq('business_id', biz.id).then(({ data: ms }) => {
          setMatches((ms || []).map((m: Record<string, unknown>) => {
            const inv = m.investors as Record<string, unknown> | null
            const usr = inv?.users as Record<string, unknown> | null
            return { id: m.id as string, name: (usr?.name as string) || 'Investor' }
          }))
        })
      })
    })
  }, [])

  const handleSend = async () => {
    if (!selectedMatch || files.length === 0 || uploading) return
    setUploading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')

      const { data: biz } = await supabase.from('businesses').select('id, name').eq('owner_id', user.id).single()
      if (!biz) throw new Error('Business not found')

      const uploaded: string[] = []
      for (const file of files) {
        const ext  = file.name.split('.').pop()
        const path = `${biz.id}/reports/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const bucket = file.type.startsWith('image/') ? 'business-photos' : 'documents'
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
        uploaded.push(urlData.publicUrl)

        await supabase.from('business_documents').insert({
          id: crypto.randomUUID(),
          business_id: biz.id,
          match_id: selectedMatch,
          uploader_id: user.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type.startsWith('image/') ? 'image' : 'document',
          file_size: file.size,
        })
      }

      // Chat message
      const reportId = crypto.randomUUID()
      await supabase.from('business_reports').insert({
        id: reportId,
        business_id: biz.id,
        match_id: selectedMatch,
        template: 'media',
        title: caption || 'Media report',
        content: caption,
        media_urls: uploaded,
        status: 'sent',
      })

      await supabase.from('messages').insert({
        id: crypto.randomUUID(),
        match_id: selectedMatch,
        sender_id: user.id,
        content: `📎 ${caption || 'Shared media update'} (${files.length} file${files.length > 1 ? 's' : ''})`,
        content_type: 'report',
        ref_id: reportId,
      })

      setDone(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (done) {
    return (
      <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <AppHeader title="Media report" leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>} sticky />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>Sent!</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 32 }}>
            Your media report has been shared with your investor.
          </div>
          <button onClick={() => router.push('/business/records')} className="btn btn-forest">Back to Records</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Attach media"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '16px 16px 40px' }}>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, lineHeight: 1.55 }}>
          Upload photos or documents as your report. Receipts, dashboards, progress shots — anything visual.
        </p>

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.04em',
          textTransform: 'uppercase', marginBottom: 6 }}>Send to</div>
        <select value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 20,
            border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
            fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
          <option value="">Select investor…</option>
          {matches.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed var(--line-strong)', borderRadius: 16,
            padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
            background: 'var(--bone)', marginBottom: 16,
          }}>
          <Icon name="upload" size={28} color="var(--ink-3)" />
          <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 10, fontWeight: 600 }}>
            {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Tap to pick files'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>Photos, PDFs, screenshots</div>
          <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={e => setFiles(Array.from(e.target.files || []))} />
        </div>

        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bone)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px' }}>
                <Icon name={f.type.startsWith('image/') ? 'photo' : 'doc'} size={16} color="var(--forest)" />
                <span style={{ fontSize: 13, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Icon name="close" size={14} color="var(--ink-3)" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.04em',
          textTransform: 'uppercase', marginBottom: 6 }}>Caption (optional)</div>
        <textarea value={caption} onChange={e => setCaption(e.target.value)}
          placeholder="Add context for your investor…" rows={3}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 20,
            border: '1.5px solid var(--line-strong)', background: 'var(--bone)',
            fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
            outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />

        {error && <p style={{ fontSize: 13, color: 'var(--clay)', marginBottom: 12 }}>{error}</p>}

        <button onClick={handleSend}
          disabled={!selectedMatch || files.length === 0 || uploading}
          className="btn btn-forest btn-block">
          {uploading ? 'Uploading…' : 'Send report'}
        </button>
      </div>
    </div>
  )
}
