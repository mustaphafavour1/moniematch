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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const isOnboarding = pathname.includes('/onboarding')
      const isSignin     = pathname === '/signin'
      const isPublic     = isOnboarding || isSignin

      if (!session) {
        if (!isPublic) router.replace('/signin')
        else setReady(true)
        return
      }

      // Fetch role and enforce correct app side
      const { data: profile } = await supabase
        .from('users').select('role')
        .or(`id.eq.${session.user.id},auth_uid.eq.${session.user.id}`)
        .maybeSingle()

      const role = profile?.role

      // Logged-in user on the sign-in page → redirect to their home
      if (isSignin) {
        if (role === 'investor')           { router.replace('/investor'); return }
        if (role === 'business_owner') { router.replace('/business'); return }
        setReady(true) // no role yet — let them pick
        return
      }

      const onInvestor = pathname.startsWith('/investor')
      const onBusiness = pathname.startsWith('/business')

      if (role === 'investor'       && onBusiness && !isOnboarding) { router.replace('/investor'); return }
      if (role === 'business_owner' && onInvestor && !isOnboarding) { router.replace('/business'); return }

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
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #1c1813; }
        #app-outer {
          width: 100%; height: 100dvh;
          display: flex; align-items: center; justify-content: center;
        }
        #app-frame {
          width: 100%; height: 100dvh;
          overflow: hidden; position: relative;
          background: var(--cream);
          display: flex; flex-direction: column;
        }
        @media (min-width: 600px) {
          body {
            background:
              radial-gradient(1000px 500px at 50% -100px, #2a2418 0%, transparent 70%),
              repeating-linear-gradient(135deg, #1c1813 0 14px, #1f1b16 14px 15px);
            padding: 32px 20px;
            height: 100vh; overflow: hidden;
          }
          #app-outer { height: 100vh; }
          #app-frame {
            width: 390px; height: 844px;
            border-radius: 50px; flex-shrink: 0;
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
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'var(--canvas)', gap: 20,
            }}>
              {/* MonieMatch logo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="MonieMatch" style={{ width: 56, height: 56, objectFit: 'contain' }} />
              {/* Subtle pulse dots */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: 999,
                    background: 'var(--clay)', opacity: 0.6,
                    animation: `fadein 0.7s ease ${i * 0.18}s infinite alternate`,
                  }} />
                ))}
              </div>
            </div>
          ) : children}
        </div>
      </div>
    </>
  )
}