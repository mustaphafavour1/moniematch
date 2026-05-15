'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Zap, BarChart2, User } from 'lucide-react'

const TABS = [
  { href:'/investor',           icon: Home,     label:'Home'      },
  { href:'/investor/matches',   icon: Zap,      label:'Matches'   },
  { href:'/investor/portfolio', icon: BarChart2, label:'Portfolio' },
  { href:'/investor/profile',   icon: User,     label:'Profile'   },
]

export function InvestorBottomNav() {
  const path = usePathname()
  return (
    <nav style={{
      position:'sticky', bottom:0, left:0, right:0, zIndex:20,
      background:'rgba(247,241,232,0.95)', backdropFilter:'blur(12px)',
      borderTop:'1px solid var(--line)',
      display:'flex', alignItems:'stretch',
      paddingBottom:'env(safe-area-inset-bottom, 0px)',
    }}>
      {TABS.map(tab => {
        const active = path === tab.href || (tab.href !== '/investor' && path.startsWith(tab.href))
        const Ic = tab.icon
        return (
          <Link key={tab.href} href={tab.href} style={{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center',
            gap:3, padding:'10px 0 8px', textDecoration:'none',
            color: active ? 'var(--clay)' : 'var(--ink-3)',
            transition:'color 200ms',
          }}>
            <Ic size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{fontSize:10, fontWeight: active ? 700 : 500, fontFamily:'var(--font-body)'}}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
