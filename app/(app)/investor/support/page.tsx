'use client'
import { useRouter } from 'next/navigation'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

interface LinkItem {
  icon: string
  label: string
  sub: string
  href?: string
  isExternal?: boolean
}

const SECTIONS: { title: string; items: LinkItem[] }[] = [
  {
    title: 'Help & contact',
    items: [
      { icon: 'message', label: 'Contact us',       sub: 'Reach our support team',         href: '/contact',       isExternal: true },
      { icon: 'flag',    label: 'Report an issue',  sub: 'Flag a problem or safety concern', href: '/report-issue',  isExternal: true },
    ],
  },
  {
    title: 'Legal & policies',
    items: [
      { icon: 'doc',      label: 'Privacy policy',          sub: 'How we handle your data',               href: '/privacy',           isExternal: false },
      { icon: 'doc',      label: 'Terms of use',            sub: 'Rules and conditions of the platform',  href: '/terms',             isExternal: false },
      { icon: 'doc',      label: 'Legal & risk disclosure', sub: 'Investment risks explained',            href: '/risk-disclosure',   isExternal: false },
    ],
  },
  {
    title: 'About',
    items: [
      { icon: 'info',  label: 'About MonieMatch', sub: 'Our mission and story',    href: '/about', isExternal: true },
      { icon: 'trend-up', label: 'Version 1.0.0', sub: 'You\'re on the latest version', },
    ],
  },
]

export default function SupportPage() {
  const router = useRouter()

  function handleItem(item: LinkItem) {
    if (!item.href) return
    if (item.href.startsWith('mailto:') || item.isExternal) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    } else {
      router.push(item.href)
    }
  }

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Support & legal"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '20px 0 48px' }}>
        {SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: 28 }}>
            <div className="eyebrow" style={{ padding: '0 22px', marginBottom: 10 }}>{section.title}</div>
            <div style={{ background: 'var(--cream)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  onClick={() => handleItem(item)}
                  disabled={!item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    width: '100%', padding: '14px 22px', background: 'transparent', border: 'none',
                    borderBottom: i < section.items.length - 1 ? '1px solid var(--line)' : 'none',
                    cursor: item.href ? 'pointer' : 'default', textAlign: 'left',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: 'var(--linen)', border: '1px solid var(--line-strong)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={item.icon} size={18} color="var(--ink-2)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 1 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{item.sub}</div>
                  </div>
                  {item.href ? <Icon name="fwd" size={14} color="var(--ink-4)" /> : null}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
