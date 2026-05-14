// biz-onboarding.jsx — Business owner onboarding (splash slides, email+password, business setup)

function BizOnboarding({ onDone }) {
  const [step, setStep]         = useState(0);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [bizName, setBizName]   = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");
  const [usernameErr, setUsernameErr] = useState("");

  const cats = ["Bakery", "Fashion", "Food", "Barbing", "Repair", "Beauty", "Retail", "Other"];

  // Walkthrough content for step 0
  const [wtIdx, setWtIdx] = useState(0);
  const walkthrough = [
    {
      hero: HERO_IMG.bakery, chip: "Owner", chipStyle: "forest",
      headline: <>Capital, on terms<br /><span style={{ fontStyle:"italic", color:"var(--forest)" }}>that fit your shop.</span></>,
      body: "MonieMatch finds you investors who already want to back businesses like yours. You stay in control of the terms.",
      footnote: <div className="row gap-8" style={{ flexWrap:"wrap" }}><span className="chip outline">Revenue share</span><span className="chip outline">Fixed return</span><span className="chip outline">No daily standing order</span></div>,
    },
    {
      hero: HERO_IMG.storefront, chip: "Fair terms", chipStyle: "forest",
      headline: <>No daily<br /><span style={{ fontStyle:"italic", color:"var(--forest)" }}>standing orders.</span></>,
      body: "Your repayments move with your income. Good month? Pay more. Slow month? Pay less. No penalties for breathing.",
      footnote: <div style={{ display:"flex", gap:12, alignItems:"center", color:"var(--ink-3)", fontSize:12.5 }}><Icon name="shield" size={16} /> Escrow-backed · SEC-aligned</div>,
    },
    {
      hero: HERO_IMG.market, chip: "Simple reporting", chipStyle: "sun",
      headline: <>Speak it.<br /><span style={{ fontStyle:"italic", color:"var(--forest)" }}>We'll write it.</span></>,
      body: "Send a 60-second voice note each month. MonieMatch turns it into a structured investor report automatically.",
      footnote: <div style={{ display:"flex", gap:12, alignItems:"center", color:"var(--ink-3)", fontSize:12.5 }}><Icon name="mic" size={16} /> Voice-to-report in under 2 minutes</div>,
    },
  ];
  const wt = walkthrough[wtIdx];
  const heroFor = [wt.hero, HERO_IMG.storefront, HERO_IMG.hands, HERO_IMG.market, HERO_IMG.food];

  const slides = [
    // ── slide 0: walkthrough (3 sub-slides) ──
    <div key="w" className="screen-enter" style={{ display:"flex", flexDirection:"column", height:"100%", padding:"230px 22px 28px" }}>
      {wtIdx > 0 && (
        <button onClick={() => setWtIdx(wtIdx-1)} style={{
          position:"absolute", top:56, left:22,
          appearance:"none", border:"none",
          background:"rgba(255,255,255,0.22)", backdropFilter:"blur(8px)",
          width:36, height:36, borderRadius:999, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
        <div style={{ display:"flex", gap:8 }}>
          <div className={`chip ${wt.chipStyle}`}>{wt.chip}</div>
          <div className="chip outline">Beta</div>
        </div>
        <div className="h1" style={{ fontSize:34 }}>{wt.headline}</div>
        <p style={{ color:"var(--ink-2)", fontSize:15, lineHeight:1.5, margin:0 }}>{wt.body}</p>
        {wt.footnote}
      </div>
      <div style={{ display:"flex", gap:5, justifyContent:"center", margin:"24px 0 0" }}>
        {walkthrough.map((_, i) => (
          <div key={i} onClick={() => setWtIdx(i)} style={{ height:3, width:i===wtIdx?20:7, borderRadius:999, background:i===wtIdx?"var(--forest)":"var(--line-strong)", transition:"all 280ms", cursor:"pointer" }} />
        ))}
      </div>
      <div style={{ flex:1 }} />
      {wtIdx < 2 ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button className="btn btn-forest btn-block" onClick={() => setWtIdx(wtIdx+1)}>
            Next <Icon name="fwd" size={16} />
          </button>
          <button className="btn btn-soft btn-block" onClick={() => setStep(1)} style={{ fontSize:13 }}>
            Skip intro
          </button>
        </div>
      ) : (
        <button className="btn btn-forest btn-block" onClick={() => setStep(1)}>
          Get started <Icon name="fwd" size={16} />
        </button>
      )}
      <div style={{ textAlign:"center", marginTop:12, fontSize:12.5, color:"var(--ink-3)" }}>
        Already have an account?{" "}
        <a href="/signin" style={{ color:"var(--ink)", fontWeight:500, textDecoration:"none" }}>Sign in</a>
      </div>
    </div>,

    // ── slide 1: email + password ──
    <div key="p" className="screen-enter" style={{ padding:"230px 22px 28px", display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="row" style={{ marginBottom:18, marginTop:-200 }}>
        <RoundBtn onClick={() => setStep(0)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height:170 }} />
      <div className="h2" style={{ marginBottom:8 }}>Create your account</div>
      <p style={{ color:"var(--ink-2)", fontSize:14, margin:"0 0 20px" }}>Use an email you can always access.</p>

      <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:14, padding:"13px 16px", marginBottom:10 }}>
        <input type="email" inputMode="email" autoComplete="email" value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          placeholder="your@email.com"
          style={{ width:"100%", border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)" }} />
      </div>

      <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:14, padding:"13px 16px", marginBottom:6, display:"flex", alignItems:"center", gap:10 }}>
        <input type={showPw ? "text" : "password"} autoComplete="new-password" value={password}
          onChange={e => { setPassword(e.target.value); setError(""); }}
          placeholder="Create a password"
          style={{ flex:1, border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)" }} />
        <span onClick={() => setShowPw(s => !s)} style={{ fontSize:12, color:"var(--ink-3)", cursor:"pointer", userSelect:"none", fontWeight:500 }}>
          {showPw ? "Hide" : "Show"}
        </span>
      </div>
      <p style={{ fontSize:12, color:"var(--ink-3)", margin:"0 0 16px" }}>At least 8 characters</p>

      {error && <p style={{ fontSize:13, color:"var(--clay)", margin:"-8px 0 12px", fontWeight:500 }}>{error}</p>}

      <div style={{ flex:1 }} />
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <button className="btn btn-forest btn-block"
          disabled={!email.includes("@") || password.length < 8 || busy}
          style={{ opacity: !email.includes("@") || password.length < 8 || busy ? 0.45 : 1 }}
          onClick={async () => {
            setBusy(true); setError("");
            try {
              const { error: signUpErr } = await window.sb.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
              });
              if (signUpErr) throw signUpErr;
              setStep(2);
            } catch (e) {
              console.error("[MM] signup error:", e);
              const msg = e.message || "";
              if (msg === "reload") setError("Something went wrong. Please refresh the page.");
              else if (msg.includes("already") || msg.includes("registered")) setError("Email already registered — sign in instead.");
              else if (msg.includes("not a function") || msg.includes("undefined") || msg.includes("Cannot read")) setError("Refresh the page and try again.");
              else setError("Couldn't create account. Try again.");
            }
            setBusy(false);
          }}>
          {busy ? "Creating account…" : "Continue →"}
        </button>
        <button onClick={() => window.MM_AUTH?.signInWithGoogle("business_owner")}
          style={{ width:"100%", padding:"13px 16px", border:"1.5px solid var(--line-strong)", borderRadius:14, background:"var(--bone)", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, color:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </div>
    </div>,

    // ── slide 2: name + username ──
    <div key="n" className="screen-enter" style={{ padding:"230px 22px 28px", display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="row" style={{ marginBottom:18, marginTop:-200 }}>
        <RoundBtn onClick={() => setStep(1)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height:170 }} />
      <div className="h2" style={{ marginBottom:8 }}>What's your name?</div>
      <p style={{ color:"var(--ink-2)", fontSize:14, margin:"0 0 20px" }}>This is what investors see. Pick a username too.</p>

      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="Full name  e.g. Aisha Bello"
        style={{ border:"1px solid var(--line-strong)", background:"var(--bone)", borderRadius:14, padding:"14px 18px", fontFamily:"inherit", fontSize:15, color:"var(--ink)", outline:"none", width:"100%", marginBottom:10 }} />

      <div style={{ border:"1px solid var(--line-strong)", background:"var(--bone)", borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        <span style={{ fontSize:14, color:"var(--ink-3)", fontWeight:500 }}>@</span>
        <input value={username}
          onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")); setUsernameErr(""); }}
          placeholder="username  e.g. aishab"
          style={{ flex:1, border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)" }} />
      </div>
      <p style={{ fontSize:12, color:"var(--ink-3)", margin:"0 0 14px" }}>Lowercase letters, numbers, underscores only</p>
      {usernameErr && <p style={{ fontSize:13, color:"var(--clay)", margin:"-8px 0 10px" }}>{usernameErr}</p>}

      <div style={{ flex:1 }} />
      <button className="btn btn-forest btn-block"
        disabled={!name || username.length < 3}
        style={{ opacity: !name || username.length < 3 ? 0.45 : 1 }}
        onClick={() => setStep(4)}>
        Continue
      </button>
    </div>,

    // ── slide 4: business quick capture ──
    <div key="b" className="screen-enter" style={{ padding: "230px 22px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="row between" style={{ marginBottom: 18, marginTop: -200 }}>
        <RoundBtn onClick={() => setStep(2)}><Icon name="back" size={18} /></RoundBtn>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Step 1 of profile · 90 sec</div>
      </div>
      <div style={{ height: 170 }} />
      <div className="h2" style={{ marginBottom: 8 }}>About your business</div>
      <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 20px" }}>The minimum to start. Finish the rest later.</p>

      <div className="col gap-12">
        <Field label="Business name">
          <input value={bizName} onChange={e => setBizName(e.target.value)} placeholder="e.g. Layi Bakehouse" className="raw-input" />
        </Field>
        <Field label="Category">
          <div className="row gap-6" style={{ flexWrap: "wrap" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                      style={{ appearance: "none", border: "1px solid", borderColor: category === c ? "var(--forest)" : "var(--line-strong)",
                               background: category === c ? "var(--forest)" : "transparent", color: category === c ? "#fff" : "var(--ink-2)",
                               padding: "8px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>{c}</button>
            ))}
          </div>
        </Field>
      </div>

      <div style={{ flex: 1 }} />
      <div className="col gap-8">
        {/* ── PATCH 3a: save full profile + business before calling onDone ── */}
        <button className="btn btn-forest btn-block"
          disabled={!bizName || !category}
          style={{ opacity: !bizName || !category ? 0.45 : 1 }}
          onClick={async () => {
            const userData = { name: name || "Aisha Bello", bizName: bizName || "Layi Bakehouse", category: category || "Bakery" };
            try {
              const { data: { user } } = await window.sb.auth.getUser();
              if (user) {
                await window.sb.from("users").upsert(
                  { id: user.id, name: userData.name, username, role: "business_owner", email: user.email },
                  { onConflict: "id" }
                );
                await window.sb.from("businesses").upsert(
                  { owner_id: user.id, name: userData.bizName, category: userData.category },
                  { onConflict: "owner_id" }
                );
              }
            } catch (e) { console.warn("[MM] save biz profile:", e.message); }
            onDone(userData);
          }}>
          Save and explore
        </button>
        {/* ── PATCH 3b: skip just saves user profile without business details ── */}
        <button className="btn btn-soft btn-block"
          onClick={async () => {
            const userData = { name: name || "Aisha Bello", bizName: "Layi Bakehouse", category: "Bakery" };
            try {
              const { data: { user } } = await window.sb.auth.getUser();
              if (user) {
                await window.sb.from("users").upsert(
                  { id: user.id, name: userData.name, username, role: "business_owner", email: user.email },
                  { onConflict: "id" }
                );
              }
            } catch (e) { console.warn("[MM] save profile (skip):", e.message); }
            onDone(userData);
          }}>
          Skip — finish later
        </button>
      </div>

      <style>{`.raw-input { border: 1px solid var(--line-strong); background: var(--bone); border-radius: 14px; padding: 12px 14px; font-family: inherit; font-size: 15px; color: var(--ink); outline: none; width: 100%; }`}</style>
    </div>,
  ];

  return (
    <div className="app" style={{ position: "absolute", inset: 0 }}>
      <TopHero src={step === 0 ? wt.hero : heroFor[step]} height={300} tone={0.6} />
      <div className="statusbar-spacer" />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {slides[step]}
      </div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", padding: "0 0 18px" }}>
        {slides.map((_, i) => (
          <div key={i} style={{ height: 3, width: i === step ? 22 : 8,
            background: i === step ? "var(--forest)" : "var(--line-strong)", borderRadius: 999, transition: "all 320ms" }} />
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 6, letterSpacing: 0.04, textTransform: "uppercase" }}>{label}</div>
      {children}
    </div>
  );
}


Object.assign(window, { BizOnboarding, Field });