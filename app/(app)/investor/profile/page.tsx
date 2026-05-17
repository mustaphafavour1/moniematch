'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile } from '@/lib/db'
import { signOut } from '@/lib/auth'
import type { UserProfile } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon } from '@/components/app/Icon'

export default function InvProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [signOutConfirm, setSignOutConfirm] = useState(false)

  useEffect(() => { getMyProfile().then(setUser) }, [])

  const name     = user?.name     || 'Investor'
  const initials = user?.initials || '?'
  const color    = user?.color    || 'var(--forest)'
  const range         = user?.investmentRange || '—'
  const returnChips   = user?.returnStructures || []
  const cadenceChips  = user?.reportingCadence || []
  const interests     = (user?.interests || []).join(', ') || '—'
  const uname    = user?.username ? `@${user.username}` : ''

  const handleSignOut = async () => {
    await signOut()
    router.replace('/signin')
  }

  return (
    <div className="app-screen scroll" style={{paddingBottom:40}}>
      <div className="pad" style={{paddingTop:14, display:'flex', flexDirection:'column', alignItems:'center'}}>
        {user?.avatar_url
          ? <img src={user.avatar_url} alt="avatar" style={{ width: 88, height: 88, borderRadius: 999, objectFit: 'cover' }} />
          : <Avatar name={name} initials={initials} color={color} size={88} />
        }
        <div className="h1" style={{fontSize:26, marginTop:14}}>{name}</div>
        {uname && <div style={{fontSize:13, color:'var(--clay)', marginTop:2, fontWeight:600}}>{uname}</div>}
        <div style={{fontSize:13, color:'var(--ink-3)', marginTop:2}}>Investor · {user?.city || 'Nigeria'}</div>
      </div>

      {/* Edit personal info button */}
      <div className="pad" style={{marginTop:16, textAlign:'center'}}>
        <button onClick={() => router.push('/investor/profile/edit')}
          className="btn btn-soft" style={{fontSize:13, padding:'8px 18px'}}>
          Edit personal info
        </button>
      </div>

      <div className="pad" style={{marginTop:20}}>
        <div className="row between" style={{marginBottom:10}}>
          <div className="eyebrow">Investment preferences</div>
          <button onClick={() => router.push('/investor/preferences')}
            style={{appearance:'none', border:'1.5px solid var(--line-strong)', background:'none',
              borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:600, color:'var(--clay)',
              cursor:'pointer', fontFamily:'var(--font-body)'}}>
            Edit
          </button>
        </div>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <PrefRow icon="money"    label="Investment range"   value={range} />
          <ChipRow icon="trend-up" label="Preferred returns"  chips={returnChips} />
          <ChipRow icon="bell"     label="Reporting cadence"  chips={cadenceChips} />
          <PrefRow icon="shop"     label="Industries"         value={interests} last />
        </div>
      </div>

      <div className="pad" style={{marginTop:14}}>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <ActionRow icon="calendar" label="Deal history"         onClick={() => router.push('/investor/history')} />
          <ActionRow icon="doc"      label="Contract information" onClick={() => router.push('/investor/contracts')} />
          <ActionRow icon="settings" label="Settings"            onClick={() => router.push('/investor/settings')} />
          <ActionRow icon="logout"   label="Sign out"            onClick={() => setSignOutConfirm(true)} danger />
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

const RETURN_LABEL: Record<string, string> = {
  revenue_share: 'Revenue share',
  fixed:         'Fixed returns',
  equity:        'Equity',
  balanced:      'Either works',
}

function PrefRow({ icon, label, value, last }: { icon:string; label:string; value:string; last?:boolean }) {
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

function ChipRow({ icon, label, chips, last }: { icon:string; label:string; chips:string[]; last?:boolean }) {
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
              {chips.map(c => <span key={c} className="chip" style={{fontSize:12}}>{RETURN_LABEL[c] || c}</span>)}
            </div>
          : <div style={{fontSize:14, color:'var(--ink)', marginTop:2}}>—</div>
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
      <span style={{fontSize:14, color: danger ? 'var(--clay)' : 'var(--ink)', fontWeight: danger ? 500 : 400, flex:1}}>
        {label}
      </span>
      {!danger && <Icon name="fwd" size={14} color="var(--ink-4)" />}
    </div>
  )
}
