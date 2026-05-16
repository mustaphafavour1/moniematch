'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile, getInterestedInvestors, getRecentInvestors } from '@/lib/db'
import { fmtNaira, relTime, greet } from '@/lib/utils'
import type { UserProfile, Investor } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon, RoundBtn } from '@/components/app/Icon'
import { ProgressRing } from '@/components/app/Progress'

// ── State helpers ─────────────────────────────────────────────────────────────
function isProfileComplete(u: UserProfile | null) {
  return !!(u?.bizName && u?.category && u?.description)
}
function hasActiveDeals(interested: Investor[]) {
  return interested.some(i => i.status === 'negotiating' || i.status === 'signed')
}

type BizState = 'loading' | 'new' | 'live' | 'has-interest' | 'has-deals'

export default function BizHomePage() {
  const router = useRouter()
  const [user,       setUser]       = useState<UserProfile | null>(null)
  const [interested, setInterested] = useState<Investor[]>([])
  const [recent,     setRecent]     = useState<Investor[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getInterestedInvestors(),
      getRecentInvestors(3),
    ]).then(([profile, inv, rec]) => {
      if (!profile) { router.replace('/business/onboarding'); return }
      setUser(profile)
      setInterested(inv)
      setRecent(rec)
      setLoading(false)
    })
  }, [router])

  const profileComplete = isProfileComplete(user)
  const state: BizState = loading
    ? 'loading'
    : !profileComplete
      ? 'new'
      : hasActiveDeals(interested)
        ? 'has-deals'
        : interested.length > 0
          ? 'has-interest'
          : 'live'

  const userName = user?.name || 'Owner'
  const bizName  = user?.bizName || 'your business'

  if (loading) {
    return (
      <div className="app-screen" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:14, color:'var(--ink-3)' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div className="app-screen scroll" style={{ paddingBottom:24 }}>

      {/* ── Header ── */}
      <div className="pad" style={{ paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div className="row gap-10">
          <Avatar name={userName} initials={user?.initials||'?'} color={user?.color||'var(--clay)'} size={36} />
          <div className="col">
            <div style={{ fontSize:11.5, color:'var(--ink-3)' }}>{greet()}</div>
            <div style={{ fontSize:15, fontWeight:500, color:'var(--ink)' }}>{userName.split(' ')[0]}</div>
          </div>
        </div>
        <RoundBtn onClick={() => router.push('/business/notifications')}>
          <Icon name="bell" size={18} />
        </RoundBtn>
      </div>

      {/* ── Hero headline ── */}
      <div className="pad fadein" style={{ marginTop:18 }}>
        <div className="eyebrow" style={{ marginBottom:10 }}>
          {state === 'new'    ? 'Recent investors on MonieMatch'
          : state === 'live'  ? 'Your profile is live'
          : state === 'has-interest' ? `${interested.length} investor${interested.length > 1 ? 's' : ''} interested`
          : `${interested.length} active deal${interested.length > 1 ? 's' : ''}`}
        </div>
        <div className="h1" style={{ fontSize:30 }}>
          {state === 'new' ? (
            <>Complete your profile to attract investors to <span style={{ fontStyle:'italic', color:'var(--forest)' }}>{bizName}.</span></>
          ) : state === 'live' ? (
            <>Investors can now find <span style={{ fontStyle:'italic', color:'var(--forest)' }}>{bizName}.</span></>
          ) : state === 'has-interest' ? (
            <>{interested.length === 1 ? 'One investor wants' : `${interested.length} investors want`} a piece of <span style={{ fontStyle:'italic', color:'var(--forest)' }}>{bizName}.</span></>
          ) : (
            <>Keep your investors updated on <span style={{ fontStyle:'italic', color:'var(--forest)' }}>{bizName}.</span></>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          STATE: new — show recent investors to browse
      ════════════════════════════════════════════════════ */}
      {state === 'new' && (
        <>
          <div className="pad fadein d1" style={{ marginTop:18 }}>
            <div className="col gap-10">
              {recent.slice(0, 3).map((inv, i) => (
                <BrowseInvestorCard key={inv.id} inv={inv} index={i}
                  onClick={() => router.push(`/business/investors/${inv.id}`)} />
              ))}
              {recent.length === 0 && (
                <div style={{ padding:'24px 0', fontSize:13.5, color:'var(--ink-3)', textAlign:'center' }}>
                  Investors are joining. Check back soon.
                </div>
              )}
            </div>
          </div>
          <div className="pad fadein d2" style={{ marginTop:14 }}>
            <div onClick={() => router.push('/business/profile/edit')}
              style={{ background:'var(--linen)', borderRadius:18, padding:'14px 16px',
                border:'1px dashed var(--line-strong)', cursor:'pointer',
                display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'var(--forest-tint)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon name="user" size={18} color="var(--forest)" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>Complete profile to get matched</div>
                <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:2 }}>Investors find businesses with complete profiles first →</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════
          STATE: live — profile complete, no interest yet
      ════════════════════════════════════════════════════ */}
      {state === 'live' && (
        <div className="pad fadein d1" style={{ marginTop:18 }}>
          <div className="card sand" style={{ textAlign:'center', padding:'28px 18px' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'var(--forest-tint)',
              display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <Icon name="match" size={28} color="var(--forest)" />
            </div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)', lineHeight:1.2, marginBottom:10 }}>
              MonieMatch is finding investors for you.
            </div>
            <p style={{ fontSize:13.5, color:'var(--ink-2)', margin:'0 0 14px', lineHeight:1.5 }}>
              Your profile is live. Investors will appear here as they match. Complete your profile to rank higher.
            </p>
            <button onClick={() => router.push('/business/investors')} className="btn btn-forest">
              View all investors →
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STATE: has-interest — review investor offers
      ════════════════════════════════════════════════════ */}
      {state === 'has-interest' && (
        <div className="pad fadein d1" style={{ marginTop:18 }}>
          <div className="col gap-10">
            {interested.slice(0, 3).map((inv, i) => (
              <OfferCard key={inv.id} inv={inv} highlight={i===0}
                onClick={() => router.push(`/business/investors/${inv.id}`)} />
            ))}
          </div>
          {interested.length > 3 && (
            <button onClick={() => router.push('/business/investors')} className="btn btn-soft btn-block"
              style={{ marginTop:12 }}>
              View all {interested.length} investors →
            </button>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STATE: has-deals — active deal management
      ════════════════════════════════════════════════════ */}
      {state === 'has-deals' && (
        <div className="pad fadein d1" style={{ marginTop:18 }}>
          {/* Active deal card */}
          {interested.filter(i => i.status === 'negotiating' || i.status === 'signed').slice(0,2).map((inv, i) => (
            <div key={inv.id} className="card" style={{ marginBottom:10, padding:14, cursor:'pointer' }}
              onClick={() => router.push(`/business/investors/${inv.id}`)}>
              <div className="row gap-12">
                <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={42} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14.5, fontWeight:500, color:'var(--ink)' }}>{inv.name}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{fmtNaira(inv.offer?.amount||0, {compact:true})} · {inv.offer?.terms}</div>
                </div>
                <span className="chip forest">Active</span>
              </div>
            </div>
          ))}

          {/* Next steps */}
          <div style={{ marginTop:14 }}>
            <div className="eyebrow" style={{ marginBottom:10 }}>Next steps</div>
            <div className="col gap-10">
              <NextStepCard
                icon="mic" color="var(--clay)"
                title="Submit your monthly report"
                sub="Due in 8 days · 3 investors waiting"
                onClick={() => router.push('/business/reporting')}
              />
              <NextStepCard
                icon="trend-up" color="var(--forest)"
                title="Show investors your traction"
                sub="Add recent sales data or a customer win"
                onClick={() => router.push('/business/profile/edit')}
              />
            </div>
          </div>

          {/* Referral */}
          <div className="card linen" style={{ marginTop:18, textAlign:'center', padding:'20px 16px' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--ink)', lineHeight:1.3, marginBottom:8 }}>
              Know a business that deserves capital?
            </div>
            <p style={{ fontSize:13, color:'var(--ink-2)', margin:'0 0 14px' }}>
              Refer them to MonieMatch. Help more businesses get backed.
            </p>
            <button className="btn btn-soft" style={{ fontSize:13 }}>
              <Icon name="send" size={14} color="var(--ink-2)" /> Share referral link
            </button>
          </div>
        </div>
      )}

      {/* ── Raise progress (all states except new) ── */}
      {state !== 'new' && (
        <div className="pad fadein d2" style={{ marginTop:22 }}>
          <div className="card" style={{ background:'var(--forest)', borderColor:'rgba(45,93,63,0.5)', cursor:'pointer' }}
            onClick={() => router.push('/business/profile/edit')}>
            <div className="row between" style={{ marginBottom:12 }}>
              <div className="eyebrow" style={{ color:'rgba(255,255,255,0.6)' }}>Your active raise</div>
              <div className="row gap-4" style={{ color:'rgba(255,255,255,0.7)' }}>
                <span style={{ fontSize:11 }}>Edit</span>
                <Icon name="fwd" size={13} color="rgba(255,255,255,0.7)" />
              </div>
            </div>
            <div className="row between" style={{ alignItems:'flex-end' }}>
              <div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', letterSpacing:0.04 }}>Raised</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:30, color:'#fff' }}>₦0</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.7)' }}>of {fmtNaira(user?.rangeMax||1_200_000, {compact:true})} target</div>
              </div>
              <ProgressRing value={0} size={56} stroke={5} color="var(--sun)" trackColor="rgba(255,255,255,0.15)">
                <span style={{ fontFamily:'var(--font-display)', fontSize:16, color:'#fff' }}>0%</span>
              </ProgressRing>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile completion tasks (new + live states) ── */}
      {(state === 'new' || state === 'live') && (
        <div className="pad fadein d3" style={{ marginTop:22 }}>
          <div className="card">
            <div className="row gap-14" style={{ marginBottom:14 }}>
              <ProgressRing value={state === 'new' ? 20 : 60} size={56} stroke={5} color="var(--forest)">
                <span style={{ fontFamily:'var(--font-display)', fontSize:16, color:'var(--ink)' }}>
                  {state === 'new' ? '20%' : '60%'}
                </span>
              </ProgressRing>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500 }}>
                  {state === 'new' ? '3 steps to your first investor' : 'Strengthen your listing'}
                </div>
                <div style={{ fontSize:12.5, color:'var(--ink-3)', marginTop:4 }}>
                  More complete = higher in investor feeds
                </div>
              </div>
            </div>
            <div className="hr" style={{ margin:'0 0 14px' }} />
            <div className="col gap-12">
              <ProfileTask
                done={!!(user?.bizName && user?.category)}
                label="1. Complete verification"
                sub="CAC certificate, referees, exact business address"
              />
              <ProfileTask
                done={false}
                label="2. Upload media"
                sub="Shop photos, customer testimonials, product catalogue"
              />
              <ProfileTask
                done={false}
                label="3. Complete business records"
                sub="No. of employees, bank statements, monthly income"
              />
            </div>
            <button onClick={() => router.push('/business/profile/edit')}
              className="btn btn-forest btn-block" style={{ marginTop:16 }}>
              Continue profile →
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BrowseInvestorCard({ inv, onClick, index }: { inv:Investor; onClick:()=>void; index:number }) {
  return (
    <div onClick={onClick} className="card fadein" style={{ padding:14, cursor:'pointer', animationDelay:`${index*80}ms` }}>
      <div className="row gap-12">
        <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={44} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14.5, fontWeight:500, color:'var(--ink)' }}>{inv.name}</div>
          <div style={{ fontSize:12, color:'var(--ink-3)' }}>{inv.role} · {inv.city}</div>
          <div className="row gap-6" style={{ marginTop:6, flexWrap:'wrap' }}>
            {(inv.interests||[]).slice(0,2).map(t => (
              <span key={t} className="chip" style={{ fontSize:11 }}>{t}</span>
            ))}
            {(inv.interests||[]).length > 2 && (
              <span className="chip outline" style={{ fontSize:11 }}>+{inv.interests.length - 2}</span>
            )}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:12, color:'var(--ink-3)' }}>Range</div>
          <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>{inv.investmentRange || '—'}</div>
        </div>
      </div>
    </div>
  )
}

function OfferCard({ inv, highlight, onClick }: { inv:Investor; highlight:boolean; onClick:()=>void }) {
  return (
    <div onClick={onClick} className="card" style={{ padding:14, cursor:'pointer',
      borderColor: highlight ? 'var(--forest)' : 'var(--line)', borderWidth: highlight ? 1.5 : 1 }}>
      <div className="row between" style={{ alignItems:'flex-start' }}>
        <div className="row gap-12">
          <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={42} />
          <div className="col">
            <div className="row gap-6" style={{ marginBottom:2 }}>
              <div style={{ fontSize:14.5, fontWeight:500 }}>{inv.name}</div>
              {highlight && <span className="chip clay" style={{ padding:'2px 8px', fontSize:10 }}>New</span>}
            </div>
            <div style={{ fontSize:12, color:'var(--ink-3)' }}>{inv.role}</div>
          </div>
        </div>
        <div className="col" style={{ alignItems:'flex-end' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ink)' }}>
            {fmtNaira(inv.offer?.amount||0, {compact:true})}
          </div>
          <div style={{ fontSize:11, color:'var(--ink-3)' }}>
            {inv.whenISO ? relTime(inv.whenISO) : ''}
          </div>
        </div>
      </div>
      <div className="hr" style={{ margin:'12px 0' }} />
      <div className="row gap-6" style={{ fontSize:12.5 }}>
        <Icon name="trend-up" size={14} color="var(--ink-3)" />
        <span>{inv.offer?.terms || inv.returnStructures?.[0] || 'Revenue share'}</span>
      </div>
    </div>
  )
}

function NextStepCard({ icon, color, title, sub, onClick }: {
  icon:string; color:string; title:string; sub:string; onClick:()=>void
}) {
  return (
    <div onClick={onClick} className="card sand" style={{ padding:'14px 16px', cursor:'pointer' }}>
      <div className="row gap-12">
        <div style={{ width:40, height:40, borderRadius:11, background:`${color}18`,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon name={icon} size={20} color={color} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)' }}>{title}</div>
          <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:2 }}>{sub}</div>
        </div>
        <Icon name="fwd" size={14} color="var(--ink-3)" />
      </div>
    </div>
  )
}

function ProfileTask({ done, label, sub }: { done:boolean; label:string; sub:string }) {
  return (
    <div className="row gap-12" style={{ alignItems:'flex-start' }}>
      <div style={{ width:24, height:24, borderRadius:999, flexShrink:0, marginTop:1,
        border: done ? 'none' : '1.5px solid var(--line-strong)',
        background: done ? 'var(--forest)' : 'transparent',
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        {done && <Icon name="check" size={13} color="#fff" />}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13.5, fontWeight:500, color: done ? 'var(--ink-3)' : 'var(--ink)',
          textDecoration: done ? 'line-through' : 'none' }}>{label}</div>
        <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:2 }}>{sub}</div>
      </div>
    </div>
  )
}