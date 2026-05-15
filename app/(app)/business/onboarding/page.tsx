'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signInWithGoogle } from '@/lib/auth'
import { Icon } from '@/components/app/Icon'

const CATS = ['Bakery','Fashion','Food','Barbing','Repair','Beauty','Retail','Other']

export default function BizOnboardingPage() {
  const router = useRouter()
  const [step,        setStep]        = useState(0)
  const [slideIdx,    setSlideIdx]    = useState(0)
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [name,        setName]        = useState('')
  const [username,    setUsername]    = useState('')
  const [bizName,     setBizName]     = useState('')
  const [category,    setCategory]    = useState('')
  const [busy,        setBusy]        = useState(false)
  const [error,       setError]       = useState('')
  const [usernameErr, setUsernameErr] = useState('')

  const SLIDES = [
    { chip:'Owner',          headline:<>Capital, on terms<br/><span style={{fontStyle:'italic',color:'var(--forest)'}}>that fit your shop.</span></>, body:'MonieMatch finds you investors who already want to back businesses like yours. You stay in control of the terms.' },
    { chip:'Fair terms',     headline:<>No daily<br/><span style={{fontStyle:'italic',color:'var(--forest)'}}>standing orders.</span></>,         body:'Your repayments move with your income. Good month? Pay more. Slow month? Pay less. No penalties for breathing.' },
    { chip:'Simple reports', headline:<>Speak it.<br/><span style={{fontStyle:'italic',color:'var(--forest)'}}>We\'ll write it.</span></>,          body:'Send a 60-second voice note each month. MonieMatch turns it into a structured investor report automatically.' },
  ]
  const slide = SLIDES[slideIdx]

  const handleSignUp = async () => {
    setBusy(true); setError('')
    try {
      const { error: e } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password })
      if (e) throw e
      setStep(2)
    } catch(e: unknown) {
      const msg = (e instanceof Error ? e.message : '').toLowerCase()
      if (msg.includes('already') || msg.includes('registered')) setError('Email already registered — sign in instead.')
      else setError('Couldn\'t create account. Try again.')
    }
    setBusy(false)
  }

  const handleSaveProfile = async () => {
    setBusy(true); setUsernameErr(''); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from('users').upsert(
          { id:user.id, name, username, role:'business_owner', email:user.email ?? null } as any,
          { onConflict:'id' }
        )
      }
      setStep(3)
    } catch(e: unknown) {
      const msg = (e instanceof Error ? e.message : '').toLowerCase()
      if (msg.includes('unique') || msg.includes('duplicate')) setUsernameErr('That username is taken. Try another.')
      else setError('Couldn\'t save profile. Try again.')
    }
    setBusy(false)
  }

  const handleSaveBiz = async (skip = false) => {
    setBusy(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !skip) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from('businesses').upsert(
          { owner_id:user.id, name:bizName, category } as any,
          { onConflict:'owner_id' }
        )
      }
      router.replace('/business')
    } catch(e) { console.warn('[MM] save biz:', e); router.replace('/business') }
    setBusy(false)
  }

  return (
    <div style={{width:'100%', height:'100%', background:'var(--cream)',
      fontFamily:'var(--font-body)', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden'}}>

      <div style={{position:'absolute', inset:0,
        background:'linear-gradient(160deg, #DFF0E6 0%, var(--cream) 60%)', zIndex:0}} />

      <div style={{position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>

        {/* ── Walkthrough ── */}
        {step === 0 && (
          <div className="screen-enter" style={{display:'flex', flexDirection:'column', height:'100%', padding:'64px 22px 28px'}}>
            <div style={{display:'flex', gap:8, marginBottom:24}}>
              <span className="chip forest">{slide.chip}</span>
              <span className="chip outline">Beta</span>
            </div>
            <div className="h1" style={{fontSize:36, marginBottom:16}}>{slide.headline}</div>
            <p style={{color:'var(--ink-2)', fontSize:15, lineHeight:1.6, margin:'0 0 32px'}}>{slide.body}</p>
            <div style={{display:'flex', gap:5, marginBottom:24}}>
              {SLIDES.map((_,i) => (
                <div key={i} onClick={() => setSlideIdx(i)} style={{
                  height:3, width:i===slideIdx?20:7, borderRadius:999,
                  background:i===slideIdx?'var(--forest)':'var(--line-strong)',
                  transition:'all 280ms', cursor:'pointer',
                }} />
              ))}
            </div>
            <div style={{flex:1}} />
            {slideIdx < SLIDES.length - 1 ? (
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                <button className="btn btn-forest btn-block" onClick={() => setSlideIdx(slideIdx+1)}>
                  Next <Icon name="fwd" size={16} color="currentColor" />
                </button>
                <button className="btn btn-soft btn-block" onClick={() => setStep(1)} style={{fontSize:13}}>Skip intro</button>
              </div>
            ) : (
              <button className="btn btn-forest btn-block" onClick={() => setStep(1)}>
                Get started <Icon name="fwd" size={16} color="currentColor" />
              </button>
            )}
            <div style={{textAlign:'center', marginTop:12, fontSize:12.5, color:'var(--ink-3)'}}>
              Already have an account?{' '}
              <a href="/signin" style={{color:'var(--ink)', fontWeight:500, textDecoration:'none'}}>Sign in</a>
            </div>
          </div>
        )}

        {/* ── Email + Password ── */}
        {step === 1 && (
          <div className="screen-enter" style={{display:'flex', flexDirection:'column', height:'100%', padding:'64px 22px 28px'}}>
            <button onClick={() => setStep(0)} className="btn btn-soft" style={{width:38,height:38,padding:0,borderRadius:999,marginBottom:24}}>
              <Icon name="back" size={18} />
            </button>
            <div className="h2" style={{marginBottom:8}}>Create your account</div>
            <p style={{color:'var(--ink-2)', fontSize:14, margin:'0 0 20px'}}>Use an email you can always access.</p>

            <div style={{background:'var(--bone)', border:'1px solid var(--line-strong)', borderRadius:14, padding:'13px 16px', marginBottom:10}}>
              <input type="email" inputMode="email" autoComplete="email" value={email}
                onChange={e => { setEmail(e.target.value); setError('') }} placeholder="your@email.com"
                style={{width:'100%', border:0, background:'transparent', outline:'none', fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)'}} />
            </div>
            <div style={{background:'var(--bone)', border:'1px solid var(--line-strong)', borderRadius:14, padding:'13px 16px', marginBottom:6, display:'flex', alignItems:'center', gap:10}}>
              <input type={showPw?'text':'password'} autoComplete="new-password" value={password}
                onChange={e => { setPassword(e.target.value); setError('') }} placeholder="Create a password"
                style={{flex:1, border:0, background:'transparent', outline:'none', fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)'}} />
              <span onClick={() => setShowPw(s=>!s)} style={{fontSize:12, color:'var(--ink-3)', cursor:'pointer', userSelect:'none', fontWeight:500}}>
                {showPw?'Hide':'Show'}
              </span>
            </div>
            <p style={{fontSize:12, color:'var(--ink-3)', margin:'0 0 16px'}}>At least 8 characters</p>
            {error && <p style={{fontSize:13, color:'var(--clay)', margin:'-8px 0 12px', fontWeight:500}}>{error}</p>}

            <div style={{flex:1}} />
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <button className="btn btn-forest btn-block"
                disabled={!email.includes('@') || password.length < 8 || busy}
                onClick={handleSignUp}>
                {busy ? 'Creating account…' : 'Continue →'}
              </button>
              <button onClick={() => signInWithGoogle('business_owner')} style={{
                width:'100%', padding:'13px 16px', border:'1.5px solid var(--line-strong)',
                borderRadius:14, background:'var(--bone)', cursor:'pointer',
                fontFamily:'var(--font-body)', fontSize:14, fontWeight:600, color:'var(--ink)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </div>
          </div>
        )}

        {/* ── Name + Username ── */}
        {step === 2 && (
          <div className="screen-enter" style={{display:'flex', flexDirection:'column', height:'100%', padding:'64px 22px 28px'}}>
            <button onClick={() => setStep(1)} className="btn btn-soft" style={{width:38,height:38,padding:0,borderRadius:999,marginBottom:24}}>
              <Icon name="back" size={18} />
            </button>
            <div className="h2" style={{marginBottom:8}}>What&apos;s your name?</div>
            <p style={{color:'var(--ink-2)', fontSize:14, margin:'0 0 20px'}}>This is what investors see. Pick a username too.</p>

            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name  e.g. Aisha Bello"
              style={{border:'1px solid var(--line-strong)', background:'var(--bone)', borderRadius:14,
                padding:'14px 18px', fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)', outline:'none', width:'100%', marginBottom:10}} />
            <div style={{border:'1px solid var(--line-strong)', background:'var(--bone)', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
              <span style={{fontSize:14, color:'var(--ink-3)', fontWeight:500}}>@</span>
              <input value={username} onChange={e=>{ setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'')); setUsernameErr('') }}
                placeholder="username  e.g. aishab"
                style={{flex:1, border:0, background:'transparent', outline:'none', fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)'}} />
            </div>
            <p style={{fontSize:12, color:'var(--ink-3)', margin:'0 0 14px'}}>Lowercase letters, numbers, underscores only</p>
            {usernameErr && <p style={{fontSize:13, color:'var(--clay)', margin:'-8px 0 10px'}}>{usernameErr}</p>}
            {error && <p style={{fontSize:13, color:'var(--clay)', margin:'0 0 10px'}}>{error}</p>}

            <div style={{flex:1}} />
            <button className="btn btn-forest btn-block" disabled={!name || username.length < 3 || busy} onClick={handleSaveProfile}>
              {busy ? 'Saving…' : 'Continue'}
            </button>
          </div>
        )}

        {/* ── Business quick capture ── */}
        {step === 3 && (
          <div className="screen-enter" style={{display:'flex', flexDirection:'column', height:'100%', padding:'64px 22px 28px'}}>
            <div className="row between" style={{marginBottom:24}}>
              <button onClick={() => setStep(2)} className="btn btn-soft" style={{width:38,height:38,padding:0,borderRadius:999}}>
                <Icon name="back" size={18} />
              </button>
              <div style={{fontSize:12.5, color:'var(--ink-3)'}}>Step 1 of profile · 90 sec</div>
            </div>
            <div className="h2" style={{marginBottom:8}}>About your business</div>
            <p style={{color:'var(--ink-2)', fontSize:14, margin:'0 0 20px'}}>The minimum to start. Finish the rest later.</p>

            <div className="col gap-12">
              <div>
                <div style={{fontSize:11.5, color:'var(--ink-3)', marginBottom:6, letterSpacing:0.04, textTransform:'uppercase'}}>Business name</div>
                <input value={bizName} onChange={e=>setBizName(e.target.value)} placeholder="e.g. Layi Bakehouse"
                  style={{border:'1px solid var(--line-strong)', background:'var(--bone)', borderRadius:14,
                    padding:'12px 14px', fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink)', outline:'none', width:'100%'}} />
              </div>
              <div>
                <div style={{fontSize:11.5, color:'var(--ink-3)', marginBottom:6, letterSpacing:0.04, textTransform:'uppercase'}}>Category</div>
                <div className="row gap-6" style={{flexWrap:'wrap'}}>
                  {CATS.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{
                      appearance:'none', border:'1px solid',
                      borderColor:category===c?'var(--forest)':'var(--line-strong)',
                      background:category===c?'var(--forest)':'transparent',
                      color:category===c?'#fff':'var(--ink-2)',
                      padding:'8px 14px', borderRadius:999, fontSize:12.5, fontWeight:500, cursor:'pointer', fontFamily:'var(--font-body)',
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{flex:1}} />
            <div className="col gap-8">
              <button className="btn btn-forest btn-block" disabled={!bizName||!category||busy} onClick={() => handleSaveBiz(false)}>
                {busy ? 'Saving…' : 'Save and explore'}
              </button>
              <button className="btn btn-soft btn-block" onClick={() => handleSaveBiz(true)}>
                Skip — finish later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
