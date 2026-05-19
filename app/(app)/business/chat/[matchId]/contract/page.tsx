'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getContractHtml } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function BizContractViewPage() {
  const router       = useRouter()
  useParams() // matchId not needed on this page
  const searchParams  = useSearchParams()
  const contractId    = searchParams.get('contractId') ?? ''

  const [html,              setHtml]              = useState('')
  const [bizSigned,         setBizSigned]         = useState(false)
  const [invSigned,         setInvSigned]         = useState(false)
  const [paymentConfirmed,  setPaymentConfirmed]  = useState(false)
  const [loading,           setLoading]           = useState(true)

  useEffect(() => {
    if (!contractId) { setLoading(false); return }
    Promise.all([
      getContractHtml(contractId),
      supabase.from('signed_contracts')
        .select('biz_signed_at, inv_signed_at, payment_confirmed_at')
        .eq('id', contractId).maybeSingle(),
    ]).then(([h, { data }]) => {
      setHtml(h || '')
      setBizSigned(!!data?.biz_signed_at)
      setInvSigned(!!data?.inv_signed_at)
      setPaymentConfirmed(!!data?.payment_confirmed_at)
      setLoading(false)
    })
  }, [contractId])

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Agreement document"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky />
      <div className="scroll" style={{ flex: 1, padding: '16px 20px 40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>Loading…</div>
        ) : (
          <>
            {/* Status bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <StatusChip label="Business signed" done={bizSigned} />
              <StatusChip label="Payment received" done={paymentConfirmed} />
              <StatusChip label="Investor signed" done={invSigned} />
            </div>

            {!paymentConfirmed && (
              <div style={{ background: 'var(--linen)', border: '1px solid var(--line-strong)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 20 }}>
                Waiting for investor to complete payment. You will be notified once funds are received.
              </div>
            )}

            {html ? (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', padding: '20px', overflowX: 'auto', fontSize: 14 }}
                dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ink-3)' }}>Agreement not found.</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatusChip({ label, done }: { label: string; done: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999,
      background: done ? '#ecfdf5' : 'var(--linen)', border: `1px solid ${done ? '#a7f3d0' : 'var(--line)'}`,
      fontSize: 12, color: done ? '#065f46' : 'var(--ink-3)', fontWeight: 500 }}>
      <span>{done ? '✓' : '○'}</span>{label}
    </div>
  )
}
