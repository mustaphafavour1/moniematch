'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { getContractHtml, investorSignContract, getDealForOffer } from '@/lib/db'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function InvSignPage() {
  const router       = useRouter()
  const { matchId }  = useParams() as { matchId: string }
  const searchParams  = useSearchParams()
  const contractId    = searchParams.get('contractId') ?? ''
  const offerId       = searchParams.get('offerId') ?? ''

  const [html,      setHtml]      = useState('')
  const [dealId,    setDealId]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [showPad,   setShowPad]   = useState(false)
  const [hasDrawn,  setHasDrawn]  = useState(false)
  const [signing,   setSigning]   = useState(false)
  const [signed,    setSigned]    = useState(false)
  const [error,     setError]     = useState('')

  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  useEffect(() => {
    if (!contractId) return
    Promise.all([
      getContractHtml(contractId),
      offerId ? getDealForOffer(offerId) : Promise.resolve(null),
    ]).then(([contractHtml, dealInfo]) => {
      setHtml(contractHtml || '')
      if (dealInfo) setDealId(dealInfo.dealId)
      setLoading(false)
    })
  }, [contractId, offerId])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const src = 'touches' in e ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }
  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    isDrawingRef.current = true
    const { x, y } = getPos(e, canvas)
    ctx.beginPath(); ctx.moveTo(x, y)
  }
  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    e.preventDefault()
    const { x, y } = getPos(e, canvas)
    ctx.strokeStyle = '#1a4fd6'; ctx.lineWidth = 2; ctx.lineCap = 'round'
    ctx.lineTo(x, y); ctx.stroke()
    setHasDrawn(true)
  }
  function stopDraw() { isDrawingRef.current = false }
  function clearCanvas() {
    const canvas = canvasRef.current
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  async function handleSign() {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return
    setSigning(true); setError('')
    try {
      const sigBase64 = canvas.toDataURL('image/png')
      await investorSignContract(contractId, sigBase64, dealId)
      setSigned(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not save signature. Please try again.')
    } finally {
      setSigning(false)
    }
  }

  if (loading) return (
    <div className="app-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Loading agreement…</div>
    </div>
  )

  if (signed) return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: 999, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 24 }}>✓</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginBottom: 10 }}>Agreement signed!</div>
      <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 32 }}>
        The deal is now complete. The business will receive the transfer shortly. You can view this agreement any time from your chat.
      </div>
      <button onClick={() => router.push(`/investor/chat/${matchId}`)} className="btn btn-forest btn-block">
        Back to chat
      </button>
    </div>
  )

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Sign agreement"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky />

      <div className="scroll" style={{ flex: 1, padding: '16px 20px 32px' }}>
        {/* Contract preview */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--line)', padding: '20px', marginBottom: 24, overflowX: 'auto', fontSize: 14 }}
          dangerouslySetInnerHTML={{ __html: html }} />

        {/* Signature section */}
        <div style={{ background: 'var(--bone)', borderRadius: 16, border: '1px solid var(--line)', padding: '20px 18px' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Your signature</div>

          {!showPad ? (
            <button onClick={() => setShowPad(true)}
              style={{ width: '100%', padding: '16px', borderRadius: 12, border: '1.5px dashed var(--line-strong)', background: 'var(--cream)', color: 'var(--ink-3)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              + Draw your signature
            </button>
          ) : (
            <>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>Draw your signature below</div>
              <canvas
                ref={canvasRef} width={320} height={100}
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                style={{ border: '1px solid var(--line-strong)', borderRadius: 10, width: '100%', background: 'var(--cream)', cursor: 'crosshair', touchAction: 'none' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button onClick={clearCanvas}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--bone)', fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Clear
                </button>
              </div>
            </>
          )}

          {error && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#7f1d1d' }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 20px 32px', borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
        <button onClick={handleSign} disabled={!hasDrawn || signing || !dealId}
          className="btn btn-forest btn-block"
          style={{ opacity: !hasDrawn || signing || !dealId ? 0.5 : 1 }}>
          {signing ? 'Signing…' : 'Sign & complete deal'}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
          By signing, you agree to the terms of the investment agreement above.
        </div>
      </div>
    </div>
  )
}
