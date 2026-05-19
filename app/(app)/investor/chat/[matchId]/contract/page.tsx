'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getContractHtml } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function InvContractViewPage() {
  const router       = useRouter()
  useParams() // matchId not needed on this page
  const searchParams  = useSearchParams()
  const contractId    = searchParams.get('contractId') ?? ''
  const [html,    setHtml]    = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contractId) { setLoading(false); return }
    getContractHtml(contractId).then(h => { setHtml(h || ''); setLoading(false) })
  }, [contractId])

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Agreement document"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky />
      <div className="scroll" style={{ flex: 1, padding: '16px 20px 40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>Loading…</div>
        ) : html ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', padding: '20px', overflowX: 'auto', fontSize: 14 }}
            dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>Agreement not found.</div>
        )}
      </div>
    </div>
  )
}
