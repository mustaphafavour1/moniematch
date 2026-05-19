'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_USER = 'moniematchadmin'
const ADMIN_PASS = 'MonieMatchAdmin/2001'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem('mm_admin', '1')
      router.push('/admin/templates')
    } else {
      setError('Invalid credentials.')
    }
  }

  const s: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    border: '1.5px solid #d1d5db', background: '#f9fafb',
    fontSize: 15, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>MonieMatch Admin</div>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>Contract template management</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={s} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
            placeholder="Password" style={s} />
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#7f1d1d' }}>
            {error}
          </div>
        )}

        <button onClick={handleLogin} style={{ marginTop: 20, width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#111827', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Sign in
        </button>
      </div>
    </div>
  )
}
