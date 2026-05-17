'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile, uploadAvatar } from '@/lib/db'
import { saveProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { AppHeader } from '@/components/app/AppHeader'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'

export default function BizOwnerEditPage() {
  const router  = useRouter()
  const fileRef    = useRef<HTMLInputElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [state,     setState]     = useState('')
  const [city,      setCity]      = useState('')
  const [occupation,setOccupation]= useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [initials,  setInitials]  = useState('?')
  const [color,     setColor]     = useState('var(--forest)')
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [showPad,   setShowPad]   = useState(false)
  const [hasDrawn,  setHasDrawn]  = useState(false)
  const [existingSig, setExistingSig] = useState('')
  const [savingSig, setSavingSig] = useState(false)
  const [legalName,    setLegalName]    = useState('')
  const [legalAddress, setLegalAddress] = useState('')
  const [legalBizName,    setLegalBizName]    = useState('')
  const [legalBizAddress, setLegalBizAddress] = useState('')

  useEffect(() => {
    getMyProfile().then(p => {
      if (!p) return
      setName(p.name || '')
      setPhone(p.phone || '')
      setState(p.state || '')
      setCity(p.city || '')
      setOccupation(p.occupation || '')
      setAvatarUrl(p.avatar_url || '')
      setInitials(p.initials || '?')
      setColor(p.color || 'var(--forest)')
      setLegalName(p.legal_name || '')
      setLegalAddress(p.legal_address || '')
      setLegalBizName(p.legal_biz_name || '')
      setLegalBizAddress(p.legal_biz_address || '')
      // load existing signature via signed URL
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        supabase.storage.from('signatures').createSignedUrl(`${user.id}/signature.png`, 3600)
          .then(({ data }) => { if (data?.signedUrl) setExistingSig(data.signedUrl) })
      })
    })
  }, [])

  const handleAvatarClick = () => fileRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadAvatar(file)
      setAvatarUrl(url)
    } catch (err) {
      setError('Failed to upload photo. Please try again.')
      console.warn('[MM] avatar upload:', err)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    setError('')
    try {
      await saveProfile({
        name:             name.trim(),
        phone:            phone.trim() || null,
        state:            state.trim() || null,
        city:             city.trim() || null,
        occupation:       occupation.trim() || null,
        legal_name:       legalName.trim() || null,
        legal_address:    legalAddress.trim() || null,
        legal_biz_name:   legalBizName.trim() || null,
        legal_biz_address: legalBizAddress.trim() || null,
      })
      router.back()
    } catch (err) {
      setError('Failed to save. Please try again.')
      console.warn('[MM] save owner profile:', err)
    }
    setSaving(false)
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    isDrawingRef.current = true
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = '#1a4fd6'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    setHasDrawn(true)
  }

  function stopDraw() { isDrawingRef.current = false }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  async function saveSignature() {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return
    setSavingSig(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not signed in')
      const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej(), 'image/png'))
      const path = `${user.id}/signature.png`
      const { error: upErr } = await supabase.storage.from('signatures').upload(path, blob, { upsert: true, contentType: 'image/png' })
      if (upErr) throw upErr
      const { data: signed } = await supabase.storage.from('signatures').createSignedUrl(path, 3600)
      const url = signed?.signedUrl || ''
      await supabase.from('users').update({ signature_url: url }).eq('id', user.id)
      setExistingSig(url)
      setShowPad(false)
      setHasDrawn(false)
    } catch (e) { console.warn('sig save:', e) }
    setSavingSig(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: 0, background: 'transparent', outline: 'none',
    fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink)',
  }
  const fieldWrap: React.CSSProperties = {
    background: 'var(--bone)', border: '1px solid var(--line-strong)',
    borderRadius: 14, padding: '12px 16px',
  }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Edit personal info"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>} sticky />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad col gap-20" style={{ paddingTop: 16, paddingBottom: 32 }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: 88, height: 88, borderRadius: 999, objectFit: 'cover' }} />
                : <Avatar name={name || '?'} initials={initials} color={color} size={88} />
              }
              <button onClick={handleAvatarClick} disabled={uploading}
                style={{ position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: 999,
                  background: 'var(--forest)', border: '2px solid var(--cream)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer' }}>
                {uploading
                  ? <span style={{ fontSize: 9, color: '#fff' }}>…</span>
                  : <Icon name="user" size={13} color="#fff" />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={handleFileChange} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>Tap the icon to change photo</div>
          </div>

          {/* Name */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Full name</p>
            <div style={fieldWrap}>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Your full name" style={inputStyle} />
            </div>
          </div>

          {/* Occupation */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Occupation / title</p>
            <div style={fieldWrap}>
              <input value={occupation} onChange={e => setOccupation(e.target.value)}
                placeholder="e.g. Business Owner, Entrepreneur" style={inputStyle} />
            </div>
          </div>

          {/* Phone */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Phone number</p>
            <div style={fieldWrap}>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 08012345678" type="tel" style={inputStyle} />
            </div>
          </div>

          {/* State */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>State</p>
            <div style={fieldWrap}>
              <input value={state} onChange={e => setState(e.target.value)}
                placeholder="e.g. Lagos" style={inputStyle} />
            </div>
          </div>

          {/* City */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>City / area</p>
            <div style={fieldWrap}>
              <input value={city} onChange={e => setCity(e.target.value)}
                placeholder="e.g. Lekki" style={inputStyle} />
            </div>
          </div>

          {/* Signature */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Signature</p>
              {existingSig && !showPad && (
                <button onClick={() => { setShowPad(true); setHasDrawn(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-body)' }}>
                  Redo
                </button>
              )}
            </div>

            {existingSig && !showPad ? (
              <div style={{ background: 'var(--bone)', border: '1px solid var(--line-strong)', borderRadius: 14, padding: '12px 16px' }}>
                <img src={existingSig} alt="signature"
                  style={{ maxWidth: '100%', maxHeight: 80, objectFit: 'contain',
                    filter: 'invert(30%) sepia(100%) saturate(500%) hue-rotate(180deg) brightness(0.8)' }} />
              </div>
            ) : showPad || !existingSig ? (
              <div>
                {!showPad && (
                  <button onClick={() => setShowPad(true)}
                    style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1.5px dashed var(--line-strong)',
                      background: 'var(--bone)', cursor: 'pointer', fontSize: 14, color: 'var(--ink-3)',
                      fontFamily: 'var(--font-body)' }}>
                    + Add signature
                  </button>
                )}
                {showPad && (
                  <div style={{ background: 'var(--bone)', border: '1px solid var(--line-strong)', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Draw your signature below</span>
                      <button onClick={clearCanvas}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-body)' }}>
                        Clear
                      </button>
                    </div>
                    <canvas ref={canvasRef} width={320} height={100}
                      style={{ display: 'block', width: '100%', height: 100, cursor: 'crosshair', touchAction: 'none' }}
                      onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                      onTouchStart={e => { e.preventDefault(); startDraw(e) }}
                      onTouchMove={e => { e.preventDefault(); draw(e) }}
                      onTouchEnd={stopDraw}
                    />
                    <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={saveSignature} disabled={!hasDrawn || savingSig}
                        style={{ padding: '8px 20px', borderRadius: 10, border: 'none',
                          background: hasDrawn ? 'var(--forest)' : 'var(--linen)',
                          color: hasDrawn ? '#fff' : 'var(--ink-4)',
                          fontSize: 13, fontWeight: 600, cursor: hasDrawn ? 'pointer' : 'not-allowed',
                          fontFamily: 'var(--font-body)' }}>
                        {savingSig ? 'Saving…' : 'Save signature'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {error && (
            <div style={{ background: 'var(--clay-tint)', border: '1px solid var(--clay)',
              borderRadius: 12, padding: '10px 14px', fontSize: 13, color: 'var(--clay)' }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 22px 28px', borderTop: '1px solid var(--line)', background: 'var(--cream)' }}>
        <button onClick={handleSave} disabled={saving || uploading} className="btn btn-forest btn-block">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
