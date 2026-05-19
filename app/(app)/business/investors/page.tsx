'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile, getInterestedInvestors, getRecentInvestors } from '@/lib/db'
import { fmtNaira, relTime } from '@/lib/utils'
import type { Investor, UserProfile } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon } from '@/components/app/Icon'

function isProfileComplete(u: UserProfile | null) {
  return !!(u?.bizName && u?.category && u?.description)
}

export default function BizInvestorsPage() {
  const router = useRouter()
  const [user,       setUser]       = useState<UserProfile | null>(null)
  const [interested, setInterested] = useState<Investor[]>([])
  const [recent,     setRecent]     = useState<Investor[]>([])
  const [query,      setQuery]      = useState('')
  const [draft,      setDraft]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [showSticky, setShowSticky] = useState(false)
  const titleRef    = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([getMyProfile(), getInterestedInvestors(), getRecentInvestors(50)])
      .then(([p, inv, rec]) => {
        setUser(p)
        setInterested(inv)
        setRecent(rec)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const profileComplete = isProfileComplete(user)
  const hasMatches      = interested.length > 0

  // Build display list: interested first (by score), then recent not already in interested
  const interestedIds = new Set(interested.map(i => i.id))
  const allInvestors  = profileComplete && hasMatches
    ? [...interested, ...recent.filter(i => !interestedIds.has(i.id))]
    : recent

  // Client-side search across name, interests, range, city
  const filtered = useMemo(() => {
    if (!query.trim()) return allInvestors
    const q = query.toLowerCase()
    return allInvestors.filter(inv =>
      inv.name.toLowerCase().includes(q) ||
      (inv.role || '').toLowerCase().includes(q) ||
      (inv.city || '').toLowerCase().includes(q) ||
      (inv.investmentRange || '').toLowerCase().includes(q) ||
      (inv.interests || []).some(t => t.toLowerCase().includes(q)) ||
      (inv.returnStructures || []).some(r => r.toLowerCase().includes(q))
    )
  }, [allInvestors, query])

  return (
    <div className="app-screen scroll" style={{ paddingBottom: 16 }}>
      {/* Sticky compact header — appears when title scrolls off screen */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--cream)',
        borderBottom: showSticky ? '1px solid var(--line)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: showSticky ? '11px 22px' : '0 22px',
        height: showSticky ? 'auto' : 0,
        overflow: 'hidden',
        transition: 'padding 150ms, border-color 150ms',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' }}>Investors</div>
        <button onClick={() => { searchInput.current?.focus(); searchInput.current?.scrollIntoView({ behavior: 'smooth' }) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
          <Icon name="search" size={18} color="var(--forest)" />
        </button>
      </div>

      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="eyebrow">
          {loading ? '…' : profileComplete && hasMatches
            ? `${interested.length} interested`
            : 'Browse investors'}
        </div>
        <div ref={titleRef} className="h1" style={{ fontSize: 36, marginTop: 6 }}>Investors</div>
        {!loading && (
          <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5, margin: '8px 0 0' }}>
            {profileComplete && hasMatches
              ? `${interested.length} investor${interested.length > 1 ? 's' : ''} expressed interest in your business.`
              : `${recent.length} investors currently active on MonieMatch.`}
          </p>
        )}
      </div>

      {/* Complete profile banner (shown when profile is incomplete) */}
      {!profileComplete && !loading && (
        <div className="pad" style={{ marginTop: 14 }}>
          <div onClick={() => router.push('/business/profile/edit')}
            style={{ background: 'var(--forest-tint)', border: '1.5px solid var(--forest)', borderRadius: 16,
              padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--forest)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="user" size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--forest)' }}>
                Complete your profile to get matched
              </div>
              <div style={{ fontSize: 12, color: 'var(--forest)', opacity: 0.75, marginTop: 2 }}>
                Investors find complete businesses first →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="pad" style={{ marginTop: 14 }}>
        <div className="row gap-10" style={{ background: 'var(--bone)', border: '1px solid var(--line-strong)',
          borderRadius: 14, padding: '10px 14px' }}>
          {(draft || query) && (
            <button onClick={() => { setDraft(''); setQuery('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Icon name="close" size={16} color="var(--ink-3)" />
            </button>
          )}
          <input
            ref={searchInput}
            placeholder="Search by name, industry, range, city…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setQuery(draft) }}
            style={{ flex: 1, border: 0, background: 'transparent', outline: 'none',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}
          />
          <button onClick={() => setQuery(draft)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <Icon name="search" size={18} color="var(--forest)" />
          </button>
        </div>
      </div>

      {/* Section label */}
      {!loading && profileComplete && hasMatches && !query && (
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Interested in your business</div>
        </div>
      )}

      {/* Investor list */}
      <div className="pad col gap-10" style={{ marginTop: 10 }}>
        {loading
          ? [0, 1, 2].map(i => <div key={i} style={{ height: 100, borderRadius: 18, background: 'var(--linen)' }} />)
          : filtered.length > 0
            ? filtered.map((inv, i) => {
                const isInterested = interestedIds.has(inv.id)
                return (
                  <div key={inv.id} className="fadein" style={{ animationDelay: `${i * 40}ms` }}>
                    <InvestorCard inv={inv} isMatch={isInterested}
                      onClick={() => router.push(`/business/investors/${inv.id}${inv.matchId ? `?matchId=${inv.matchId}` : ''}`)} />
                  </div>
                )
              })
            : (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
                {query
                  ? `No investors matching "${query}"`
                  : 'No investors yet — check back soon as more join.'}
              </div>
            )
        }
      </div>

      {/* "More investors" polish nudge */}
      {!loading && !query && (
        <div className="pad" style={{ marginTop: 18 }}>
          <div className="card linen" style={{ textAlign: 'center', padding: '22px 18px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 8 }}>
              More investors see your profile{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--forest)' }}>when it&apos;s complete.</span>
            </div>
            <button onClick={() => router.push('/business/profile/edit')} className="btn btn-forest" style={{ marginTop: 6 }}>
              Polish profile
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InvestorCard({ inv, isMatch, onClick }: { inv: Investor; isMatch: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className="card" style={{ padding: 14, cursor: 'pointer',
      borderColor: isMatch ? 'var(--forest)' : 'var(--line)', borderWidth: isMatch ? 1.5 : 1 }}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div className="row gap-12">
          <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row gap-8" style={{ marginBottom: 2, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink)' }}>{inv.name}</div>
              {isMatch && <span className="chip forest" style={{ fontSize: 10, padding: '2px 7px' }}>Interested</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {inv.role}{inv.city ? ` · ${inv.city}` : ''}
            </div>
            {(inv.interests || []).length > 0 && (
              <div className="row gap-6" style={{ marginTop: 6, flexWrap: 'wrap' }}>
                {inv.interests.slice(0, 3).map(t => (
                  <span key={t} className="chip" style={{ fontSize: 10.5 }}>{t}</span>
                ))}
                {inv.interests.length > 3 && (
                  <span className="chip outline" style={{ fontSize: 10.5 }}>+{inv.interests.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
          {isMatch && inv.offer ? (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)' }}>
                {fmtNaira(inv.offer.amount, { compact: true })}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {inv.whenISO ? relTime(inv.whenISO) : ''}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
              {inv.investmentRange || '—'}
            </div>
          )}
          <Icon name="fwd" size={14} color="var(--ink-4)" style={{ marginTop: 6 }} />
        </div>
      </div>
    </div>
  )
}