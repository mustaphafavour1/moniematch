'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile, getMyMatches, getRecentBusinesses } from '@/lib/db'
import { fmtNaira } from '@/lib/utils'
import type { Business, UserProfile } from '@/lib/types'
import { Icon } from '@/components/app/Icon'
import { MatchDial } from '@/components/app/MatchDial'
import { Progress } from '@/components/app/Progress'

function isProfileComplete(u: UserProfile | null) {
  return !!(u?.investmentRange && u?.interests?.length)
}

export default function InvMatchesPage() {
  const router  = useRouter()
  const [user,    setUser]    = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<Business[]>([])
  const [recent,  setRecent]  = useState<Business[]>([])
  const [filter,  setFilter]  = useState('all')
  const [query,   setQuery]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyProfile(), getMyMatches(), getRecentBusinesses(20)])
      .then(([p, m, r]) => {
        setUser(p)
        setMatches(m)
        setRecent(r)
        setLoading(false)
      })
  }, [])

  const profileComplete = isProfileComplete(user)

  // Merge: real matches first (by score), then fill with recent not already in matches
  const matchIds = new Set(matches.map(b => b.id))
  const browsable = profileComplete
    ? matches  // show matched only when profile complete
    : [...matches, ...recent.filter(b => !matchIds.has(b.id))]  // recent for new users

  const cats = ['all', ...Array.from(new Set(browsable.map(b => b.category).filter(Boolean))).slice(0, 5)]

  const list = browsable
    .filter(b => filter === 'all' || b.category === filter)
    .filter(b => !query || b.business.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="app-screen scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="eyebrow">
          {profileComplete ? 'Matched to your preferences' : 'Browse businesses'}
        </div>
        <div className="h1" style={{ fontSize: 36, marginTop: 8 }}>Matches</div>
        {!loading && (
          <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.5, margin: '8px 0 0' }}>
            {profileComplete
              ? `${matches.length} ${matches.length === 1 ? 'business matches' : 'businesses match'} your range, return type and cadence.`
              : `${browsable.length} businesses currently raising on MonieMatch.`}
          </p>
        )}
      </div>

      {/* Complete profile banner */}
      {!profileComplete && !loading && (
        <div className="pad" style={{ marginTop: 14 }}>
          <div onClick={() => router.push('/investor/preferences')}
            style={{ background: 'var(--clay-tint)', border: '1.5px solid var(--clay)', borderRadius: 16,
              padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--clay)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="match" size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--clay)' }}>
                Complete your profile to see matches
              </div>
              <div style={{ fontSize: 12, color: 'var(--clay)', opacity: 0.75, marginTop: 2 }}>
                Set range, interests &amp; return preference →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="pad" style={{ marginTop: 14 }}>
        <div className="row gap-10" style={{ background: 'var(--bone)', border: '1px solid var(--line-strong)',
          borderRadius: 14, padding: '10px 14px' }}>
          <Icon name="search" size={18} color="var(--ink-3)" />
          <input placeholder="Search by business name" value={query} onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, border: 0, background: 'transparent', outline: 'none',
              fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }} />
        </div>
      </div>

      {/* Category filters */}
      <div style={{ marginTop: 12, paddingLeft: 22, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: 6, paddingRight: 22 }}>
          {cats.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              appearance: 'none', border: '1px solid',
              borderColor: filter === cat ? 'var(--ink)' : 'var(--line-strong)',
              background: filter === cat ? 'var(--ink)' : 'transparent',
              color: filter === cat ? 'var(--cream)' : 'var(--ink-2)',
              padding: '8px 14px', borderRadius: 999,
              fontSize: 12.5, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-body)', transition: 'all 200ms',
            }}>
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="pad col gap-10" style={{ marginTop: 16 }}>
        {loading
          ? [0, 1, 2].map(i => <div key={i} style={{ height: 120, borderRadius: 18, background: 'var(--linen)' }} />)
          : list.length > 0
            ? list.map((b, i) => (
                <div key={b.id} className="fadein" style={{ animationDelay: `${i * 40}ms` }}>
                  <BizCard biz={b} showScore={profileComplete && b.matchScore > 0}
                    onClick={() => router.push(`/investor/matches/${b.id}`)} />
                </div>
              ))
            : (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
                {query ? `No results for "${query}"` : 'No businesses yet — check back soon.'}
              </div>
            )
        }
      </div>
    </div>
  )
}

function BizCard({ biz, onClick, showScore }: { biz: Business; onClick: () => void; showScore: boolean }) {
  const pct     = biz.target > 0 ? Math.round((biz.raised / biz.target) * 100) : 0
  const cadence = biz.reportingCadence?.[0] || biz.cadence?.[0] || ''
  return (
    <div onClick={onClick} className="card" style={{ padding: 14, cursor: 'pointer' }}>
      <div className="row gap-12">
        <div style={{ width: 64, height: 64, borderRadius: 14, background: `${biz.color}20`, color: biz.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 24, flexShrink: 0 }}>
          {biz.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.2 }}>{biz.business}</div>
              {biz.ownerName && (
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>by {biz.ownerName}</div>
              )}
            </div>
            {showScore && <MatchDial score={biz.matchScore} size={36} label={false} />}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>{biz.category} · {biz.city}</div>
          <div className="row gap-6" style={{ marginTop: 6, flexWrap: 'wrap' }}>
            <span className="chip" style={{ background: `${biz.color}15`, color: biz.color, fontSize: 11 }}>
              {biz.returnStructures?.[0] || biz.returnHeadline.split(' · ')[0]}
            </span>
            {cadence && (
              <span className="chip outline" style={{ fontSize: 11 }}>{cadence} updates</span>
            )}
            <span className="chip outline" style={{ fontSize: 11 }}>
              {fmtNaira(biz.askMin, { compact: true })} – {fmtNaira(biz.askMax, { compact: true })}
            </span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Progress value={pct} color={biz.color} />
        <div className="row between" style={{ marginTop: 6, fontSize: 11.5, color: 'var(--ink-3)' }}>
          <span><b style={{ color: 'var(--ink)' }}>{fmtNaira(biz.raised, { compact: true })}</b> raised</span>
          <span>of {fmtNaira(biz.target, { compact: true })} · {pct}%</span>
        </div>
      </div>
    </div>
  )
}