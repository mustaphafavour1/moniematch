import { BusinessBottomNav } from '@/components/app/BottomNav'

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      height:'100%', overflow:'hidden',
      background:'var(--cream)',
      fontFamily:'var(--font-body)',
    }}>
      <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column'}}>
        {children}
      </div>
      <BusinessBottomNav />
    </div>
  )
}
