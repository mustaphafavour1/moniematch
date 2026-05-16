'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile, getMyMatches, getMyPortfolio, getRecentBusinesses } from '@/lib/db'
import { fmtNaira, fmtNairaRange, greet } from '@/lib/utils'
import type { UserProfile, Business, Deal } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { MatchDial } from '@/components/app/MatchDial'
import { Progress } from '@/components/app/Progress'
import { Photo } from '@/components/app/Photo'

// ── State helpers ─────────────────────────────────────────────────────────────
function isProfileComplete(u: UserProfile | null) {
  return !!(u?.investmentRange && u?.interests?.length)
}
function hasInvestments(deals: Deal[]) {
  return deals.some(d => d.status === 'active' || d.status === 'signed')
}

type InvState = 'loading' | 'new' | 'no-investments' | 'has-investments'

export default function InvHomePage() {
  const router = useRouter()
  const [user,    setUser]    = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<Business[]>([])
  const [recent,  setRecent]  = useState<Business[]>([])
  const [deals,   setDeals]   = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getMyMatches(),
      getMyPortfolio(),
      getRecentBusinesses(3),
    ]).then(([profile, m, d, r]) => {
      if (!profile) { router.replace('/investor/onboarding'); return }
      if (!profile.name) { router.replace('/investor/onboarding'); return }
      setUser(profile)
      setMatches(m)
      setDeals(d)
      setRecent(r)
      setLoading(false)
    })
  }, [router])

  const state: InvState = loading
    ? 'loading'
    : !isProfileComplete(user)
      ? 'new'
      : !hasInvestments(deals)
        ? 'no-investments'
        : 'has-investments'

  const totalInvested    = deals.reduce((s, d) => s + (d.invested || d.amount || 0), 0)
  const businessCount    = deals.filter(d => d.status === 'active' || d.status === 'signed').length
  const displayMatches   = state === 'new' ? recent : matches
  const heroMatches      = displayMatches.slice(0, 2)
  const weekMatches      = displayMatches.slice(2, 5)
  const userName         = user?.name || 'Investor'

  if (loading) {
    return (
      <div className="app-screen" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:14, color:'var(--ink-3)' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div className="app-screen scroll" style={{ paddingBottom:16 }}>

      {/* ── Header ── */}
      <div className="pad" style={{ paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div className="row gap-10">
          <Avatar name={userName} initials={user?.initials||'?'} color={user?.color||'var(--forest)'} size={36} />
          <div className="col">
            <div style={{ fontSize:11.5, color:'var(--ink-3)' }}>{greet()}</div>
            <div style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>{userName.split(' ')[0]}</div>
          </div>
        </div>
        <RoundBtn onClick={() => router.push('/investor/profile')}>
          <Icon name="bell" size={18} />
        </RoundBtn>
      </div>

      {/* ── Hero headline ── */}
      <div className="pad fadein" style={{ marginTop:18 }}>
        <div className="eyebrow" style={{ marginBottom:10, fontSize:9 }}>
          {state === 'new'
            ? 'Browse businesses'
            : `Today · ${heroMatches.length} ${heroMatches.length === 1 ? 'match' : 'new matches'}`}
        </div>
        <div className="h1" style={{ fontSize:28 }}>
          {state === 'new' ? (
            <>Find your first FundMate. Back a real business <span style={{ fontStyle:'italic', color:'var(--clay)' }}>you believe in.</span></>
          ) : heroMatches.length > 0 ? (
            <>{heroMatches.length === 1 ? 'One business is' : `${heroMatches.length} businesses are`} looking for the kind of capital <span style={{ fontStyle:'italic', color:'var(--clay)', fontSize:27 }}>you bring.</span></>
          ) : (
            <>Your matches are <span style={{ fontStyle:'italic', color:'var(--clay)' }}>being calculated.</span></>
          )}
        </div>
      </div>

      {/* ── Business cards carousel ── */}
      <div className="fadein d1" style={{ marginTop:18, paddingLeft:22, overflowX:'auto', scrollbarWidth:'none' }}>
        <div style={{ display:'flex', gap:12, paddingRight:22 }}>
          {heroMatches.length > 0
            ? heroMatches.map((b, i) => (
                <BizCard
                  key={b.id} biz={b} index={i} showScore={state !== 'new'}
                  onClick={() => router.push(`/investor/matches/${b.id}`)}
                />
              ))
            : <div style={{ padding:'32px 20px', color:'var(--ink-3)', fontSize:14 }}>
                No businesses yet — check back soon.
              </div>
          }
        </div>
      </div>

      {/* 'new' state: complete profile nudge */}
      {state === 'new' && (
        <div className="pad fadein d2" style={{ marginTop:14 }}>
          <div onClick={() => router.push('/investor/preferences')}
            style={{ background:'var(--linen)', borderRadius:18, padding:'14px 16px',
              border:'1px dashed var(--line-strong)', cursor:'pointer',
              display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--clay-tint)',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="match" size={18} color="var(--clay)" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>Complete your profile to see matches</div>
              <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:2 }}>Set your range, interests and return preference →</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Portfolio strip ── */}
      <div className="pad fadein d2" style={{ marginTop: state === 'new' ? 14 : 22 }}>
        {state === 'new' ? (
          /* New: start investing CTA */
          <div onClick={() => router.push('/investor/matches')}
            style={{ background:'var(--ink)', borderRadius:20, padding:'20px 18px', cursor:'pointer' }}>
            <div className="eyebrow" style={{ color:'rgba(255,252,245,0.55)', marginBottom:8 }}>Ready to invest?</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--cream)', lineHeight:1.2, marginBottom:12 }}>
              Browse businesses and start backing the real economy.
            </div>
            <div className="row gap-6" style={{ color:'var(--sun)', fontSize:13, fontWeight:600 }}>
              <Icon name="fwd" size={14} color="var(--sun)" /> See all businesses
            </div>
          </div>
        ) : (
          /* No-investments / has-investments: real portfolio strip */
          <div onClick={() => router.push('/investor/portfolio')}
            style={{ background:'var(--ink)', borderRadius:20, padding:'20px 18px', cursor:'pointer' }}>
            <div className="row between" style={{ marginBottom:12 }}>
              <div className="eyebrow" style={{ color:'rgba(255,252,245,0.55)' }}>Your portfolio</div>
              <div className="row gap-4" style={{ color:'rgba(255,252,245,0.6)' }}>
                <span style={{ fontSize:12 }}>View</span>
                <Icon name="fwd" size={14} color="rgba(255,252,245,0.6)" />
              </div>
            </div>
            <div className="row between" style={{ alignItems:'flex-end' }}>
              <div>
                <div style={{ fontSize:11, color:'rgba(255,252,245,0.55)', letterSpacing:0.04 }}>Total invested</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:30, color:'var(--cream)', lineHeight:1.05 }}>
                  {fmtNaira(totalInvested)}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'rgba(255,252,245,0.55)', letterSpacing:0.04 }}>Businesses</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:28, color:'var(--sun)' }}>
                  {businessCount}
                </div>
              </div>
            </div>
            {state === 'no-investments' && (
              <div style={{ marginTop:14, padding:'10px 12px', background:'rgba(229,160,74,0.12)', borderRadius:10,
                fontSize:12.5, color:'rgba(255,252,245,0.8)' }}>
                Invest as little as ₦100k in a business to get started.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── New this week / explore ── */}
      <div className="pad fadein d4" style={{ marginTop:24 }}>
        <div className="row between" style={{ marginBottom:14 }}>
          <div className="eyebrow">{state === 'new' ? 'Recently added' : 'New this week'}</div>
          <div onClick={() => router.push('/investor/matches')}
            style={{ fontSize:12, color:'var(--clay)', fontWeight:500, cursor:'pointer' }}>
            See all
          </div>
        </div>
        <div className="col gap-10">
          {weekMatches.length > 0
            ? weekMatches.map(b => (
                <MatchListRow
                  key={b.id} biz={b} showScore={state !== 'new'}
                  onClick={() => router.push(`/investor/matches/${b.id}`)}
                />
              ))
            : <div style={{ fontSize:13.5, color:'var(--ink-3)', padding:'8px 0' }}>
                {state === 'new' ? 'More businesses coming soon.' : 'No more matches this week.'}
              </div>
          }
        </div>
      </div>

      {/* ── Profile completion nudge (new / no-investments) ── */}
      {(state === 'new' || state === 'no-investments') && (
        <div className="pad fadein d5" style={{ marginTop:22 }}>
          <div onClick={() => router.push('/investor/preferences')}
            style={{ background:'var(--linen)', borderRadius:20, padding:'16px 18px',
              display:'flex', alignItems:'center', gap:14, border:'1px dashed var(--line-strong)',
              cursor:'pointer' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>
                {state === 'new' ? 'Set your investment preferences' : 'Refine your match preferences'}
              </div>
              <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:2 }}>3 mins · Gets you better matches</div>
            </div>
            <Icon name="fwd" size={16} color="var(--ink-3)" />
          </div>
        </div>
      )}

    </div>
  )
}

// ── Card components ───────────────────────────────────────────────────────────

function BizCard({ biz, onClick, index=0, showScore }: { biz:Business; onClick:()=>void; index?:number; showScore:boolean }) {
  return (
    <div onClick={onClick} className="fadein"
      style={{ width:260, flexShrink:0, background:'var(--bone)', borderRadius:24, padding:14,
        boxShadow:'var(--shadow-md)', border:'1px solid var(--line)', cursor:'pointer',
        animationDelay:`${index*80}ms` }}>
      <Photo label={biz.photoLab} height={140} radius={14} color={`${biz.color}15`}
        accent={showScore ? (
          <div style={{ background:'var(--bone)', borderRadius:999, padding:'4px 10px',
            fontSize:10.5, fontWeight:500, color:'var(--ink)', boxShadow:'var(--shadow-sm)' }}>
            {biz.matchScore}% match
          </div>
        ) : undefined}
      />
      <div style={{ marginTop:12 }}>
        <div className="row gap-6" style={{ marginBottom:6 }}>
          <span className="chip" style={{ background:`${biz.color}18`, color:biz.color }}>{biz.category}</span>
          <span className="chip outline">{biz.city}</span>
        </div>
        <div style={{ fontFamily:'var(--font-display)', color:'var(--ink)', lineHeight:1.1, fontSize:20 }}>{biz.business}</div>
        <div style={{ color:'var(--ink-2)', marginTop:4, lineHeight:1.45, fontSize:11 }}>{biz.use}</div>
        <div className="hr" style={{ margin:'12px 0' }} />
        <div className="row between">
          <div className="col">
            <div style={{ fontSize:10, color:'var(--ink-3)', letterSpacing:0.05, textTransform:'uppercase' }}>Raising</div>
            <div style={{ fontSize:14, color:'var(--ink)', fontWeight:500 }}>{fmtNairaRange(biz.askMin, biz.askMax)}</div>
          </div>
          <div className="col" style={{ alignItems:'flex-end' }}>
            <div style={{ fontSize:10, color:'var(--ink-3)', letterSpacing:0.05, textTransform:'uppercase' }}>Return</div>
            <div style={{ fontSize:13, color:'var(--ink)', fontWeight:500 }}>{biz.returnHeadline.split(' · ')[0]}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MatchListRow({ biz, onClick, showScore }: { biz:Business; onClick:()=>void; showScore:boolean }) {
  return (
    <div onClick={onClick} style={{ background:'var(--bone)', borderRadius:18, padding:12,
      display:'flex', alignItems:'center', gap:12, border:'1px solid var(--line)', cursor:'pointer' }}>
      <div style={{ width:56, height:56, borderRadius:14, background:`${biz.color}20`, color:biz.color,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'var(--font-display)', fontSize:22, flexShrink:0 }}>
        {biz.initials}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="row between">
          <div style={{ fontSize:14, color:'var(--ink)', fontWeight:500 }}>{biz.business}</div>
          {showScore && <div style={{ fontSize:11, color:'var(--clay)', fontWeight:500 }}>{biz.matchScore}%</div>}
        </div>
        <div style={{ fontSize:12, color:'var(--ink-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {biz.category} · {biz.city} · {biz.returnHeadline.split(' · ')[0]}
        </div>
      </div>
      <Icon name="fwd" size={14} color="var(--ink-3)" />
    </div>
  )
}