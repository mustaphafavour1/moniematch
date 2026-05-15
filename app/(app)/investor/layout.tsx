import { InvestorBottomNav } from '@/components/app/BottomNav'

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', fontFamily:'var(--font-body)' }}>
      {/* min-height:0 lets the flex child shrink so the bottom nav is always visible */}
      <div style={{ flex:1, minHeight:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {children}
      </div>
      <InvestorBottomNav />
    </div>
  )
}