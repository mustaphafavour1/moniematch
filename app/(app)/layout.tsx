'use client'
import './app.css'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isOnboarding = pathname.includes('/onboarding')
      if (!session && !isOnboarding) { router.replace('/signin'); return }
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/signin')
    })
    return () => subscription.unsubscribe()
  }, [pathname, router])

  return (
    <>
      <style>{`
        /* ── App shell outer ─────────────────────── */
        html, body { height: 100%; overflow: hidden; background: #1c1813; }
        #app-outer {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        #app-frame {
          width: 100%; height: 100%; overflow: hidden; position: relative;
          background: var(--cream);
        }
        /* Desktop: centered phone */
        @media (min-width: 600px) {
          body {
            background:
              radial-gradient(1000px 500px at 50% -100px, #2a2418 0%, transparent 70%),
              repeating-linear-gradient(135deg, #1c1813 0 14px, #1f1b16 14px 15px);
            min-height: 100vh; padding: 32px 20px;
          }
          #app-frame {
            width: 390px; height: 844px;
            border-radius: 50px;
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.08),
              0 40px 80px rgba(0,0,0,0.5),
              0 80px 160px rgba(0,0,0,0.3);
          }
        }
      `}</style>

      <div id="app-outer">
        <div id="app-frame">
          {!ready ? (
            <div style={{ width:'100%', height:'100%', display:'flex',
              alignItems:'center', justifyContent:'center', background:'var(--canvas)' }}>
              <div style={{ display:'flex', gap:6 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:8, height:8, borderRadius:999,
                    background:'var(--clay)', opacity:0.7,
                    animation:`fadein 0.6s ease ${i*0.2}s infinite alternate` }} />
                ))}
              </div>
            </div>
          ) : children}
        </div>
      </div>
    </>
  )
}
