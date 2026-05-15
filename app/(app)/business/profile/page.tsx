'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMyProfile } from '@/lib/db'
import { signOut } from '@/lib/auth'
import { fmtNairaRange } from '@/lib/utils'
import type { UserProfile } from '@/lib/types'
import { Avatar } from '@/components/app/Avatar'
import { Icon } from '@/components/app/Icon'

export default function BizProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => { getMyProfile().then(setUser) }, [])

  const name     = user?.bizName || 'My Business'
  const ownerName = user?.name   || 'Owner'
  const initials = user?.initials || '?'
  const color    = user?.color   || 'var(--clay)'

  const handleSignOut = async () => {
    await signOut()
    router.replace('/signin')
  }

  return (
    <div className="app-screen scroll" style={{paddingBottom:40}}>
      <div className="pad" style={{paddingTop:14, textAlign:'center'}}>
        <Avatar name={name} initials={initials} color={color} size={80} />
        <div className="h1" style={{fontSize:26, marginTop:14}}>{name}</div>
        <div style={{fontSize:13, color:'var(--ink-3)'}}>{ownerName} · {user?.city || 'Lagos'}</div>
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
          <ProfRow icon="money"    label="Raising"    value={user ? fmtNairaRange(user.rangeMin||0, user.rangeMax||0) : '—'} />
          <ProfRow icon="trend-up" label="Structure"  value={(user?.returnStructures||[]).join(', ') || '—'} />
          <ProfRow icon="bell"     label="Reporting"  value={(user?.reportingCadence||[]).join(', ') || 'Monthly'} />
          <ProfRow icon="doc"      label="Category"   value={user?.category as string || '—'} last />
        </div>
      </div>

      <div className="pad" style={{marginTop:14}}>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <ActionRow icon="calendar" label="Deal history"    onClick={() => {}} />
          <ActionRow icon="doc"      label="Submitted reports" onClick={() => {}} />
          <ActionRow icon="settings" label="Settings"        onClick={() => {}} />
          <ActionRow icon="logout"   label="Sign out"        onClick={handleSignOut} danger />
        </div>
      </div>
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
