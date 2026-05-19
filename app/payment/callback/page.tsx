'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentCallbackPage() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const reference   = searchParams.get('reference') || searchParams.get('trxref') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    if (!reference) { setStatus('failed'); return }
    fetch(`/api/payment/verify?reference=${reference}`)
      .then(r => r.json())
      .then(data => {
        if (data.verified && data.contractId && data.matchId) {
          setStatus('success')
          setTimeout(() => {
            router.replace(`/investor/chat/${data.matchId}/sign?contractId=${data.contractId}`)
          }, 1500)
        } else {
          setStatus('failed')
        }
      })
      .catch(() => setStatus('failed'))
  }, [reference, router])

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Verifying payment…</div>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Payment confirmed!</div>
            <div style={{ color: '#6b7280', marginTop: 8 }}>Redirecting to sign the agreement…</div>
          </>
        )}
        {status === 'failed' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Payment could not be verified</div>
            <div style={{ color: '#6b7280', marginTop: 8, marginBottom: 24 }}>Please contact support if you were charged.</div>
            <button onClick={() => router.push('/investor')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#111827', color: '#fff', fontSize: 15, cursor: 'pointer' }}>
              Back to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
