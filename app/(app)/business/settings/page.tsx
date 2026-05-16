'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'

const PREF_KEY = 'mm_biz_settings'

interface Settings {
  notif_new_investors: boolean
  notif_new_messages:  boolean
  notif_deal_signed:   boolean
  notif_email:         boolean
  notif_sms:           boolean
  privacy_show_profile: boolean
}

const DEFAULTS: Settings = {
  notif_new_investors: true,
  notif_new_messages:  true,
  notif_deal_signed:   true,
  notif_email:         true,
  notif_sms:           false,
  privacy_show_profile: true,
}

export default function BizSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY)
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch { /* ignore */ }
  }, [])

  const toggle = (key: keyof Settings) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(PREF_KEY, JSON.stringify(next))
      return next
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Settings"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>} sticky />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 16, paddingBottom: 40 }}>

          <div className="eyebrow" style={{ marginBottom: 10 }}>Notify me about</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <ToggleRow
              label="Investor interest"
              sub="When an investor expresses interest"
              value={settings.notif_new_investors}
              onToggle={() => toggle('notif_new_investors')}
            />
            <ToggleRow
              label="New messages"
              sub="When an investor sends you a message"
              value={settings.notif_new_messages}
              onToggle={() => toggle('notif_new_messages')}
            />
            <ToggleRow
              label="Deal updates"
              sub="When a deal is signed or counter-signed"
              value={settings.notif_deal_signed}
              onToggle={() => toggle('notif_deal_signed')}
              last
            />
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>How to notify me</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <ToggleRow
              label="In-app notifications"
              sub="Always on"
              value={true}
              disabled
              onToggle={() => {}}
            />
            <ToggleRow
              label="Email"
              sub="Sent to your registered email"
              value={settings.notif_email}
              onToggle={() => toggle('notif_email')}
            />
            <ToggleRow
              label="SMS"
              sub="Sent to your phone number"
              value={settings.notif_sms}
              onToggle={() => toggle('notif_sms')}
              last
            />
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>Privacy</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <ToggleRow
              label="Show my business to all investors"
              sub="When off, only matched investors see you"
              value={settings.privacy_show_profile}
              onToggle={() => toggle('privacy_show_profile')}
              last
            />
          </div>

          {saved && (
            <div className="fadein" style={{ marginTop: 16, textAlign: 'center',
              fontSize: 13, color: 'var(--forest)', fontWeight: 500 }}>
              ✓ Saved
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, sub, value, onToggle, disabled, last }: {
  label: string; sub: string; value: boolean
  onToggle: () => void; disabled?: boolean; last?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderBottom: last ? 0 : '1px solid var(--line)',
      opacity: disabled ? 0.5 : 1 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
      </div>
      <button
        onClick={disabled ? undefined : onToggle}
        style={{
          width: 46, height: 26, borderRadius: 999, border: 'none',
          background: value ? 'var(--forest)' : 'var(--linen)',
          position: 'relative', cursor: disabled ? 'default' : 'pointer',
          transition: 'background 200ms', flexShrink: 0,
        }}>
        <span style={{
          position: 'absolute', top: 3, borderRadius: 999,
          width: 20, height: 20, background: '#fff',
          left: value ? 23 : 3,
          transition: 'left 200ms',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }} />
      </button>
    </div>
  )
}
