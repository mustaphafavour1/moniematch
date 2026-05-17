'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile } from '@/lib/db'
import { signOut } from '@/lib/auth'
import { fmtNairaRange } from '@/lib/utils'
import type { UserProfile } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon } from '@/components/app/Icon'

const RETURN_LABEL: Record<string, string> = {
  revenue_share: 'Revenue share',
  fixed:         'Fixed returns',
  equity:        'Equity',
  balanced:      'Either works',
}

export default function BizProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [signOutConfirm, setSignOutConfirm] = useState(false)

  useEffect(() => { getMyProfile().then(setUser) }, [])

  const name      = user?.bizName  || 'My Business'
  const ownerName = user?.name     || 'Owner'
  const initials  = user?.initials || '?'
  const color     = user?.color    || 'var(--clay)'

  const handleSignOut = async () => {
    await signOut()
    router.replace('/signin')
  }

  const ownerLoc = [ownerName, user?.city || user?.state || 'Lagos'].filter(Boolean).join(' · ')

  const askMin       = user?.askMin || 0
  const askMax       = user?.askMax || 0
  const investRange  = askMin || askMax ? fmtNairaRange(askMin, askMax) : '—'
  const returnChips  = (user?.returnStructures || []).filter(Boolean)
  const cadenceChips = (user?.reportingCadence || []).filter(Boolean)

  return (
    <div className="app-screen scroll" style={{paddingBottom:40}}>
      <div className="pad" style={{paddingTop:14, display:'flex', flexDirection:'column', alignItems:'center'}}>
        {user?.avatar_url
          ? <img src={user.avatar_url} alt="avatar" style={{ width: 80, height: 80, borderRadius: 999, objectFit: 'cover' }} />
          : <Avatar name={name} initials={initials} color={color} size={80} />
        }
        <div className="h1" style={{fontSize:26, marginTop:14}}>{name}</div>
        <button onClick={() => router.push('/business/profile/owner-edit')}
          className="btn btn-soft" style={{fontSize:13, padding:'8px 18px', marginTop:8}}>
          Edit profile
        </button>
        <div style={{fontSize:13, color:'var(--ink-3)', marginTop:6}}>{ownerLoc}</div>
        <div className="row gap-6" style={{justifyContent:'center', marginTop:12, flexWrap:'wrap'}}>
          <span className="chip forest"><Icon name="check" size={11}/> Verified</span>
          <span className="chip clay">78% complete</span>
        </div>
      </div>

      <div className="pad" style={{marginTop:22}}>
        <div className="row between" style={{marginBottom:10}}>
          <div className="eyebrow">Your raise</div>
          <button onClick={() => router.push('/business/profile/edit')}
            style={{appearance:'none', border:'1.5px solid var(--line-strong)', background:'none',
              borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:600, color:'var(--forest)',
              cursor:'pointer', fontFamily:'var(--font-body)'}}>
            Edit
          </button>
        </div>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <ProfRow icon="money"    label="Investment range" value={investRange} />
          <ChipRow icon="trend-up" label="Return type"      chips={returnChips}  labelMap={RETURN_LABEL} fallback="—" />
          <ChipRow icon="bell"     label="Reporting"        chips={cadenceChips} fallback="—" />
          <ProfRow icon="doc"      label="Category"         value={user?.category as string || '—'} last />
        </div>
      </div>

      <div className="pad" style={{marginTop:14}}>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <ActionRow icon="calendar" label="Deal history"      onClick={() => {}} />
          <ActionRow icon="doc"      label="Submitted reports" onClick={() => {}} />
          <ActionRow icon="settings" label="Settings"          onClick={() => router.push('/business/settings')} />
          <ActionRow icon="logout"   label="Sign out"          onClick={() => setSignOutConfirm(true)} danger />
        </div>
      </div>

      {signOutConfirm && (
        <>
          <div
            onClick={() => setSignOutConfirm(false)}
            style={{position:'fixed', inset:0, background:'rgba(31,26,20,0.5)', zIndex:100}}
          />
          <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:390, zIndex:101,
            background:'var(--cream)', borderRadius:'20px 20px 0 0', padding:'28px 22px 40px'}}>
            <div style={{fontFamily:'var(--font-display)', fontSize:20}}>Sign out?</div>
            <div style={{fontSize:14, color:'var(--ink-3)', marginTop:6}}>
              You'll need to sign back in to access your account.
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:10, marginTop:24}}>
              <button
                onClick={handleSignOut}
                style={{background:'#C0392B', color:'white', border:'none', borderRadius:12,
                  padding:14, width:'100%', fontSize:15, fontWeight:600, cursor:'pointer'}}>
                Sign out
              </button>
              <button
                onClick={() => setSignOutConfirm(false)}
                style={{background:'var(--bone)', border:'1px solid var(--line)', borderRadius:12,
                  padding:14, width:'100%', fontSize:15, fontWeight:600, cursor:'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProfRow({ icon, label, value, last }: { icon:string; label:string; value:string; last?:boolean }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
      borderBottom: last ? 0 : '1px solid var(--line)'}}>
      <div style={{width:30, height:30, borderRadius:8, background:'var(--linen)', color:'var(--ink-2)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:0.04, textTransform:'uppercase'}}>{label}</div>
        <div style={{fontSize:14, color:'var(--ink)', marginTop:2}}>{value}</div>
      </div>
    </div>
  )
}

function ChipRow({ icon, label, chips, labelMap, fallback, last }: {
  icon:string; label:string; chips:string[]; labelMap?:Record<string,string>; fallback:string; last?:boolean
}) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
      borderBottom: last ? 0 : '1px solid var(--line)'}}>
      <div style={{width:30, height:30, borderRadius:8, background:'var(--linen)', color:'var(--ink-2)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:11, color:'var(--ink-3)', letterSpacing:0.04, textTransform:'uppercase'}}>{label}</div>
        {chips.length > 0
          ? <div className="row gap-6" style={{marginTop:5, flexWrap:'wrap'}}>
              {chips.map(c => (
                <span key={c} className="chip" style={{fontSize:12}}>
                  {labelMap?.[c] || c}
                </span>
              ))}
            </div>
          : <div style={{fontSize:14, color:'var(--ink)', marginTop:2}}>{fallback}</div>
        }
      </div>
    </div>
  )
}

function ActionRow({ icon, label, onClick, danger }: { icon:string; label:string; onClick:()=>void; danger?:boolean }) {
  return (
    <div onClick={onClick} style={{display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
      cursor:'pointer', borderBottom:'1px solid var(--line)'}}>
      <Icon name={icon} size={18} color={danger ? 'var(--clay)' : 'var(--ink-3)'} />
      <span style={{fontSize:14, color:danger?'var(--clay)':'var(--ink)', fontWeight:danger?500:400, flex:1}}>{label}</span>
      {!danger && <Icon name="fwd" size={14} color="var(--ink-4)" />}
    </div>
  )
}
