'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Zap, BarChart2, User, Users, FolderOpen, MessageCircle } from 'lucide-react'

// ── Investor tabs ──────────────────────────────────────────────────────────────
const INV_TABS = [
  { href:'/investor',           icon: Home,          label:'Home'      },
  { href:'/investor/matches',   icon: Zap,           label:'Matches'   },
  { href:'/investor/chat',      icon: MessageCircle, label:'Messages'  },
  { href:'/investor/portfolio', icon: BarChart2,     label:'Portfolio' },
  { href:'/investor/profile',   icon: User,          label:'Profile'   },
]

// ── Business tabs ─────────────────────────────────────────────────────────────
const BIZ_TABS = [
  { href:'/business',            icon: Home,          label:'Home'      },
  { href:'/business/investors',  icon: Users,         label:'Investors' },
  { href:'/business/chat',       icon: MessageCircle, label:'Messages'  },
  { href:'/business/records',     icon: FolderOpen,    label:'Records'   },
  { href:'/business/profile',    icon: User,          label:'Profile'   },
]

function BottomNav({ tabs }: { tabs: typeof INV_TABS }) {
  const path = usePathname()
  return (
    <nav style={{
      position:'sticky', bottom:0, left:0, right:0, zIndex:20,
      background:'rgba(247,241,232,0.95)', backdropFilter:'blur(12px)',
      borderTop:'1px solid var(--line)',
      display:'flex', alignItems:'stretch',
      paddingBottom:'env(safe-area-inset-bottom, 0px)',
    }}>
      {tabs.map(tab => {
        const active = path === tab.href || (tab.href.length > 1 && path.startsWith(tab.href))
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

export function InvestorBottomNav() { return <BottomNav tabs={INV_TABS} /> }
export function BusinessBottomNav() { return <BottomNav tabs={BIZ_TABS} /> }
