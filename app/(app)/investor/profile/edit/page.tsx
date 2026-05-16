'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile, uploadAvatar } from '@/lib/db'
import { saveProfile } from '@/lib/auth'
import { AppHeader } from '@/components/app/AppHeader'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'

const CITIES = ['Lagos','Abuja','Port Harcourt','Ibadan','Kano','Enugu','Benin City','Kaduna','Jos','Owerri','Other']

export default function InvProfileEditPage() {
  const router    = useRouter()
  const fileRef   = useRef<HTMLInputElement>(null)

  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')
  const [city,       setCity]       = useState('')
  const [occupation, setOccupation] = useState('')
  const [avatarUrl,  setAvatarUrl]  = useState('')
  const [initials,   setInitials]   = useState('?')
  const [color,      setColor]      = useState('var(--forest)')
  const [saving,     setSaving]     = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    getMyProfile().then(p => {
      if (!p) return
      setName(p.name || '')
      setPhone(p.phone || '')
      setCity(p.city || '')
      setOccupation(p.occupation || '')
      setAvatarUrl(p.avatar_url || '')
      setInitials(p.initials || '?')
      setColor(p.color || 'var(--forest)')
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
        name:       name.trim(),
        phone:      phone.trim() || null,
        city:       city || null,
        occupation: occupation.trim() || null,
      })
      router.back()
    } catch (err) {
      setError('Failed to save. Please try again.')
      console.warn('[MM] save profile:', err)
    }
    setSaving(false)
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
      <AppHeader title="Edit profile"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>} sticky />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad col gap-20" style={{ paddingTop: 16, paddingBottom: 32 }}>

          {/* Avatar picker */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: 88, height: 88, borderRadius: 999, objectFit: 'cover' }} />
                : <Avatar name={name || '?'} initials={initials} color={color} size={88} />
              }
              <button onClick={handleAvatarClick} disabled={uploading}
                style={{ position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: 999,
                  background: 'var(--ink)', border: '2px solid var(--cream)',
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
                placeholder="e.g. Business Owner, Banker, Entrepreneur" style={inputStyle} />
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

          {/* City */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>City</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c)} style={{
                  appearance: 'none', border: '1.5px solid',
                  borderColor: city === c ? 'var(--forest)' : 'var(--line-strong)',
                  background:  city === c ? 'var(--forest-tint)' : 'transparent',
                  color:       city === c ? 'var(--forest)' : 'var(--ink-2)',
                  padding: '7px 12px', borderRadius: 999,
                  fontSize: 12.5, fontWeight: city === c ? 600 : 500,
                  cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 160ms',
                }}>{c}</button>
              ))}
            </div>
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
        <button onClick={handleSave} disabled={saving || uploading} className="btn btn-primary btn-block">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
