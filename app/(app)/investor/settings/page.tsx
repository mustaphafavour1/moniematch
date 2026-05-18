'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSettings, saveSettings, setInvestorAllowContact } from '@/lib/auth'
import { AppHeader } from '@/components/app/AppHeader'
import { Icon, RoundBtn } from '@/components/app/Icon'

interface Settings {
  notif_new_matches:   boolean
  notif_new_messages:  boolean
  notif_reports:       boolean
  notif_email:         boolean
  notif_sms:           boolean
  privacy_can_contact: boolean
}

const DEFAULTS: Settings = {
  notif_new_matches:   true,
  notif_new_messages:  true,
  notif_reports:       true,
  notif_email:         true,
  notif_sms:           false,
  privacy_can_contact: true,
}

export default function InvSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    Promise.all([
      getSettings(),
      import('@/lib/supabase').then(({ supabase }) =>
        supabase.auth.getUser().then(async ({ data: { user } }) => {
          if (!user) return null
          const { data: row } = await supabase.from('users').select('id')
            .or(`id.eq.${user.id},auth_uid.eq.${user.id}`).maybeSingle()
          const profileId = row?.id || user.id
          const { data: inv } = await supabase.from('investors').select('allow_biz_msg')
            .eq('user_id', profileId).maybeSingle()
          return inv
        })
      ),
    ]).then(([raw, inv]) => {
      const base = raw && Object.keys(raw).length > 0 ? raw as Partial<Settings> : {}
      setSettings({
        ...DEFAULTS,
        ...base,
        privacy_can_contact: inv?.allow_biz_msg ?? DEFAULTS.privacy_can_contact,
      })
    })
  }, [])

  const toggle = async (key: keyof Settings) => {
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)
    setSaving(true)
    try {
      await saveSettings(next as unknown as Record<string, unknown>)
      if (key === 'privacy_can_contact') {
        await setInvestorAllowContact(next.privacy_can_contact)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch { /* ignore — optimistic UI already updated */ }
    setSaving(false)
  }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader title="Settings"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>} sticky />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 16, paddingBottom: 40 }}>

          <div className="eyebrow" style={{ marginBottom: 10 }}>Notify me about</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <ToggleRow label="New matches" sub="When a business matches your preferences"
              value={settings.notif_new_matches} onToggle={() => toggle('notif_new_matches')} />
            <ToggleRow label="New messages" sub="When a business sends you a message"
              value={settings.notif_new_messages} onToggle={() => toggle('notif_new_messages')} />
            <ToggleRow label="Monthly reports" sub="When an investee submits a report"
              value={settings.notif_reports} onToggle={() => toggle('notif_reports')} last />
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>How to notify me</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <ToggleRow label="In-app notifications" sub="Always on" value={true} disabled onToggle={() => {}} />
            <ToggleRow label="Email" sub="Sent to your registered email"
              value={settings.notif_email} onToggle={() => toggle('notif_email')} />
            <ToggleRow label="SMS" sub="Sent to your phone number"
              value={settings.notif_sms} onToggle={() => toggle('notif_sms')} last />
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>Privacy</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <ToggleRow label="Allow businesses to message me" sub="Business owners can start a conversation"
              value={settings.privacy_can_contact} onToggle={() => toggle('privacy_can_contact')} last />
          </div>

          {(saved || saving) && (
            <div className="fadein" style={{ marginTop: 16, textAlign: 'center',
              fontSize: 13, color: 'var(--forest)', fontWeight: 500 }}>
              {saving ? 'Saving…' : '✓ Saved'}
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
      borderBottom: last ? 0 : '1px solid var(--line)', opacity: disabled ? 0.5 : 1 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={disabled ? undefined : onToggle} style={{
        width: 46, height: 26, borderRadius: 999, border: 'none',
        background: value ? 'var(--forest)' : 'var(--linen)',
        position: 'relative', cursor: disabled ? 'default' : 'pointer',
        transition: 'background 200ms', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 3, borderRadius: 999,
          width: 20, height: 20, background: '#fff',
          left: value ? 23 : 3, transition: 'left 200ms',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }} />
      </button>
    </div>
  )
}
