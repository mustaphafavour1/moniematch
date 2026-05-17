'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { AppHeader } from '@/components/app/AppHeader'

export default function BizReferralPage() {
  const router = useRouter()
  const [code,    setCode]    = useState('')
  const [copied,  setCopied]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('users').select('referral_code').eq('id', user.id).maybeSingle()
      if (data?.referral_code) {
        setCode(data.referral_code)
      } else {
        const newCode = user.id.slice(0, 8).toUpperCase()
        await supabase.from('users').update({ referral_code: newCode }).eq('id', user.id)
        setCode(newCode)
      }
      setLoading(false)
    })
  }, [])

  const link = typeof window !== 'undefined' ? `${window.location.origin}/join?ref=${code}` : ''

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'Join MonieMatch', text: 'I\'m on MonieMatch — connect with investors who want to back real Nigerian businesses. Join here:', url: link })
    } else {
      handleCopy()
    }
  }

  if (loading) return (
    <div className="app-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Loading…</div>
    </div>
  )

  return (
    <div className="app-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <AppHeader
        title="Refer & invite"
        leading={<RoundBtn onClick={() => router.back()}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1, padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Hero */}
        <div style={{ background: 'var(--forest)', borderRadius: 20, padding: '28px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', fontWeight: 700, marginBottom: 8 }}>
            Grow your network
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            Invite investors you know, or business owners who are looking for funding. Build a community of trusted connections.
          </div>
        </div>

        {/* Referral link */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Your referral link</div>
          <div style={{ background: 'var(--bone)', border: '1px solid var(--line-strong)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {link || '…'}
            </div>
            <button onClick={handleCopy}
              style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--line-strong)',
                background: copied ? 'var(--forest)' : 'var(--cream)', color: copied ? '#fff' : 'var(--ink)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 200ms' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6, textAlign: 'center' }}>
            Your code: <strong style={{ color: 'var(--ink-2)', letterSpacing: 1 }}>{code}</strong>
          </div>
        </div>

        {/* Invite CTAs */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleShare} className="btn btn-primary" style={{ flex: 1 }}>
            Invite investors
          </button>
          <button onClick={handleShare} className="btn btn-forest" style={{ flex: 1 }}>
            Invite businesses
          </button>
        </div>

        {/* How it works */}
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>How it works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '1', t: 'Share your link', b: 'Send it to investors or business owners you want on the platform.' },
              { n: '2', t: 'They sign up',    b: 'They join using your referral link and create their profile.' },
              { n: '3', t: 'Connected network', b: 'Referred users are flagged as part of your trusted network.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--linen)', border: '1.5px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {s.n}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{s.t}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.5 }}>{s.b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
