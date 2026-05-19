'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function BizContractsPage() {
  const router = useRouter()

  const [title,          setTitle]          = useState('')
  const [legalName,      setLegalName]      = useState('')
  const [legalAddress,   setLegalAddress]   = useState('')
  const [legalBizName,   setLegalBizName]   = useState('')
  const [legalBizAddress,setLegalBizAddress]= useState('')
  const [bankName,       setBankName]       = useState('')
  const [bankCode,       setBankCode]       = useState('')
  const [accountNumber,  setAccountNumber]  = useState('')
  const [accountName,    setAccountName]    = useState('')
  const [banks,          setBanks]          = useState<{name:string;code:string}[]>([])
  const [existingSig,    setExistingSig]    = useState('')
  const [showPad,        setShowPad]        = useState(false)
  const [hasDrawn,       setHasDrawn]       = useState(false)
  const [savingSig,      setSavingSig]      = useState(false)
  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [error,          setError]          = useState('')

  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: userData }, { data: bizData }] = await Promise.all([
        supabase.from('users').select('title, legal_name, legal_address').eq('id', user.id).maybeSingle(),
        supabase.from('businesses').select('legal_biz_name, legal_biz_address, bank_name, bank_code, account_number, account_name').eq('owner_id', user.id).maybeSingle(),
      ])
      if (userData) {
        setTitle(userData.title || '')
        setLegalName(userData.legal_name || '')
        setLegalAddress(userData.legal_address || '')
      }
      if (bizData) {
        setLegalBizName(bizData.legal_biz_name || '')
        setLegalBizAddress(bizData.legal_biz_address || '')
        setBankName(bizData.bank_name || '')
        setBankCode(bizData.bank_code || '')
        setAccountNumber(bizData.account_number || '')
        setAccountName(bizData.account_name || '')
      }
      // Fetch Nigerian bank list from Paystack
      fetch('/api/banks').then(r => r.json()).then(d => { if (Array.isArray(d)) setBanks(d) }).catch(() => {})
      // Always regenerate fresh signed URL (stored URL may expire)
      const { data: sigUrl } = await supabase.storage.from('signatures').createSignedUrl(`${user.id}/signature.png`, 3600)
      if (sigUrl?.signedUrl) setExistingSig(sigUrl.signedUrl)
    })
  }, [])

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
    const canvas = canvasRef.current; if (!canvas) return
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  async function saveSignature() {
    const canvas = canvasRef.current; if (!canvas) return
    setSavingSig(true)
    try {
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/png'))
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const path = `${user.id}/signature.png`
      const { error: upErr } = await supabase.storage.from('signatures').upload(path, blob, { upsert: true, contentType: 'image/png' })
      if (upErr) throw upErr
      const { data: urlData } = await supabase.storage.from('signatures').createSignedUrl(path, 3600)
      const url = urlData?.signedUrl || ''
      await supabase.from('users').update({ signature_url: url }).eq('id', user.id)
      setExistingSig(url)
      setShowPad(false)
    } catch {
      setError('Could not save signature.')
    } finally {
      setSavingSig(false)
    }
  }

  async function handleSave() {
    setSaving(true); setSaved(false); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const [{ error: ue }, { error: be }] = await Promise.all([
        supabase.from('users').update({
          title:         title || null,
          legal_name:    legalName.trim() || null,
          legal_address: legalAddress.trim() || null,
        }).eq('id', user.id),
        supabase.from('businesses').update({
          legal_biz_name:    legalBizName.trim() || null,
          legal_biz_address: legalBizAddress.trim() || null,
          bank_name:         bankName || null,
          bank_code:         bankCode || null,
          account_number:    accountNumber.trim() || null,
          account_name:      accountName.trim() || null,
        }).eq('owner_id', user.id),
      ])
      if (ue) throw ue
      if (be) throw be
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', fontSize: 14, color: 'var(--ink)',
    background: 'transparent', border: 'none', outline: 'none',
    fontFamily: 'var(--font-body)',
  }
  const fieldWrap: React.CSSProperties = {
    background: 'var(--bone)', border: '1px solid var(--line-strong)',
    borderRadius: 14, padding: '12px 16px',
  }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Contract information"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Top notice */}
        <div style={{ background: 'var(--linen)', border: '1px solid var(--line-strong)',
          borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
          All details filled on this page should be as they should appear on all legal documentations, contracts and agreements.
        </div>

        {/* Personal legal identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="eyebrow">Your legal identity</div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8, textTransform: 'none', fontSize: 13, color: 'var(--ink-2)' }}>Title</p>
            <div style={fieldWrap}>
              <select value={title} onChange={e => setTitle(e.target.value)}
                style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}>
                <option value="">Select title</option>
                {['Mr.', 'Mrs.', 'Miss.', 'Ms.', 'Dr.', 'Prof.', 'Engr.', 'Barr.', 'Hon.'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8, textTransform: 'none', fontSize: 13, color: 'var(--ink-2)' }}>Full legal name</p>
            <div style={fieldWrap}>
              <input
                value={legalName}
                onChange={e => setLegalName(e.target.value)}
                placeholder="e.g. Oluwaseun Adeyemi"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8, textTransform: 'none', fontSize: 13, color: 'var(--ink-2)' }}>Permanent address</p>
            <div style={fieldWrap}>
              <textarea
                value={legalAddress}
                onChange={e => setLegalAddress(e.target.value)}
                placeholder="Your full permanent address"
                rows={3}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>

        {/* Business legal details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="eyebrow">Business legal details</div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8, textTransform: 'none', fontSize: 13, color: 'var(--ink-2)' }}>Business name</p>
            <div style={fieldWrap}>
              <input
                value={legalBizName}
                onChange={e => setLegalBizName(e.target.value)}
                placeholder="Full registered business name"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8, textTransform: 'none', fontSize: 13, color: 'var(--ink-2)' }}>Business address</p>
            <div style={fieldWrap}>
              <textarea
                value={legalBizAddress}
                onChange={e => setLegalBizAddress(e.target.value)}
                placeholder="Registered business address"
                rows={3}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>

        {/* Bank account */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="eyebrow">Payout bank account</div>
          <div style={{ background: 'var(--linen)', border: '1px solid var(--line-strong)',
            borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            Investment payments will be sent directly to this account. Make sure the details are correct.
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8, textTransform: 'none', fontSize: 13, color: 'var(--ink-2)' }}>Bank</p>
            <div style={fieldWrap}>
              <select value={bankCode} onChange={e => {
                const opt = banks.find(b => b.code === e.target.value)
                setBankCode(e.target.value)
                setBankName(opt?.name || '')
              }} style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}>
                <option value="">Select bank</option>
                {banks.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8, textTransform: 'none', fontSize: 13, color: 'var(--ink-2)' }}>Account number</p>
            <div style={fieldWrap}>
              <input
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit account number"
                inputMode="numeric"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: 8, textTransform: 'none', fontSize: 13, color: 'var(--ink-2)' }}>Account name</p>
            <div style={fieldWrap}>
              <input
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                placeholder="Name as it appears on your bank account"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Signature */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Signature</div>
          <div className="card" style={{ padding: '16px' }}>
            {existingSig && !showPad ? (
              <div>
                <img
                  src={existingSig}
                  alt="Signature"
                  style={{ maxWidth: '100%', height: 80, objectFit: 'contain',
                    filter: 'invert(30%) sepia(100%) saturate(500%) hue-rotate(180deg) brightness(0.8)' }}
                />
                <button
                  onClick={() => { setShowPad(true); setHasDrawn(false); clearCanvas() }}
                  style={{ marginTop: 12, background: 'none', border: '1px solid var(--line-strong)',
                    borderRadius: 8, padding: '7px 14px', fontSize: 12, color: 'var(--ink-2)',
                    cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Redo signature
                </button>
              </div>
            ) : !showPad ? (
              <button
                onClick={() => setShowPad(true)}
                style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px dashed var(--line-strong)',
                  background: 'var(--bone)', color: 'var(--ink-3)', fontSize: 14,
                  cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                + Add signature
              </button>
            ) : null}

            {showPad ? (
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>Draw your signature below</div>
                <canvas
                  ref={canvasRef}
                  width={320} height={100}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                  style={{ border: '1px solid var(--line-strong)', borderRadius: 10, width: '100%',
                    background: 'var(--cream)', cursor: 'crosshair', touchAction: 'none' }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button onClick={clearCanvas}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--line)',
                      background: 'var(--bone)', fontSize: 13, color: 'var(--ink-2)',
                      cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    Clear
                  </button>
                  <button onClick={saveSignature} disabled={!hasDrawn || savingSig}
                    style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none',
                      background: hasDrawn && !savingSig ? 'var(--forest)' : 'var(--linen)',
                      color: hasDrawn && !savingSig ? '#fff' : 'var(--ink-4)',
                      fontSize: 13, fontWeight: 600, cursor: hasDrawn ? 'pointer' : 'not-allowed',
                      fontFamily: 'var(--font-body)' }}>
                    {savingSig ? 'Saving…' : 'Save signature'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <div style={{ background: 'var(--clay-tint)', border: '1px solid var(--clay)',
            borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--clay)' }}>
            {error}
          </div>
        ) : null}
        {saved ? (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0',
            borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#065f46' }}>
            Saved successfully.
          </div>
        ) : null}
      </div>

      <div style={{ padding: '12px 20px 28px', borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-block">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
