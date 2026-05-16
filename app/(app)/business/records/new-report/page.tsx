'use client'
import { useRouter } from 'next/navigation'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

const FORMATS = [
  {
    icon: 'doc',
    label: 'Write a report',
    sub: 'Type out revenue, highlights, and notes in a structured form',
    href: '/business/records/new-report/write',
  },
  {
    icon: 'mic',
    label: 'Record a voice note',
    sub: 'Speak naturally — we transcribe and format it into a report automatically',
    href: '/business/reporting?format=voice',
  },
  {
    icon: 'photo',
    label: 'Attach media',
    sub: 'Upload photos or screenshots of receipts, dashboards, or progress',
    href: '/business/records/new-report/media',
  },
]

export default function NewReportPage() {
  const router = useRouter()

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="New report"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '20px 16px 40px' }}>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 24 }}>
          Choose how you want to submit your report. You can always switch between formats before sending.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FORMATS.map(f => (
            <button
              key={f.href}
              onClick={() => router.push(f.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'var(--bone)', border: '1.5px solid var(--line)',
                borderRadius: 16, padding: '18px 16px', cursor: 'pointer',
                textAlign: 'left', width: '100%', transition: 'border-color 150ms',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'var(--linen)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={f.icon} size={22} color="var(--forest)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.45 }}>{f.sub}</div>
              </div>
              <Icon name="fwd" size={16} color="var(--ink-4)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
