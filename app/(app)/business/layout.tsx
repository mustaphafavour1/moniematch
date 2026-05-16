'use client'
import { usePathname } from 'next/navigation'
import { BusinessBottomNav } from '@/components/app/BottomNav'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = !pathname.includes('/onboarding')

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', fontFamily:'var(--font-body)' }}>
      <div style={{ flex:1, minHeight:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {children}
      </div>
      {showNav && <BusinessBottomNav />}
    </div>
  )
}