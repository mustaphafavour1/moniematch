// inv-onboarding.jsx — Investor onboarding (splash slides, email+password, name)

function InvOnboarding({ onDone }) {
  const [step, setStep]       = useState(0);
  const [wtIdx, setWtIdx]     = useState(0);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [usernameErr, setUsernameErr] = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");

  // Walkthrough content for step 0
  const walkthrough = [
    {
      hero: HERO_IMG.storefront,
      chip: "Investor",
      chipStyle: "clay",
      headline: <>Back the<br /><span style={{ fontStyle: "italic", color: "var(--clay)" }}>shop on your street.</span></>,
      body: "MonieMatch connects you with verified small businesses raising small amounts. Real owners, real shops, structured deals.",
      footnote: <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--ink-3)", fontSize: 12.5 }}><Icon name="shield" size={16} /> Escrow-backed · SEC-aligned</div>,
    },
    {
      hero: HERO_IMG.market,
      chip: "Transparent",
      chipStyle: "forest",
      headline: <>Start from<br /><span style={{ fontStyle: "italic", color: "var(--clay)" }}>₦50,000.</span></>,
      body: "No complex paperwork. No minimum wealth requirement. Just pick a business you believe in, agree on terms, and back it.",
      footnote: <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><span className="chip outline">Revenue share</span><span className="chip outline">Fixed return</span><span className="chip outline">Equity</span></div>,
    },
    {
      hero: HERO_IMG.hands,
      chip: "Structured",
      chipStyle: "sun",
      headline: <>Monthly reports.<br /><span style={{ fontStyle: "italic", color: "var(--clay)" }}>Zero guesswork.</span></>,
      body: "Every business you back sends structured monthly updates. Track performance, returns, and progress — all in one place.",
      footnote: <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--ink-3)", fontSize: 12.5 }}><Icon name="chart" size={16} /> Real-time portfolio dashboard</div>,
    },
  ];
  const wt = walkthrough[wtIdx];

  const heroFor = [wt.hero, HERO_IMG.market, HERO_IMG.hands, HERO_IMG.fashion];
  const slides = [
    // ── slide 0: walkthrough (3 sub-slides) ──
    <div key="w" className="screen-enter" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "230px 22px 28px" }}>
      {/* Back chevron — only shows on slides 1 and 2 */}
      {wtIdx > 0 && (
        <button onClick={() => setWtIdx(wtIdx - 1)} style={{
          position: "absolute", top: 56, left: 22,
          appearance: "none", border: "none",
          background: "rgba(255,255,255,0.22)", backdropFilter: "blur(8px)",
          width: 36, height: 36, borderRadius: 999, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div className={`chip ${wt.chipStyle}`}>{wt.chip}</div>
          <div className="chip outline">Beta · Lagos</div>
        </div>
        <div className="h1" style={{ fontSize: 34 }}>{wt.headline}</div>
        <p style={{ color: "var(--ink-2)", fontSize: 15, lineHeight: 1.5, margin: 0 }}>{wt.body}</p>
        {wt.footnote}
      </div>
      {/* walkthrough dots */}
      <div style={{ display: "flex", gap: 5, justifyContent: "center", margin: "24px 0 0" }}>
        {walkthrough.map((_, i) => (
          <div key={i} onClick={() => setWtIdx(i)} style={{ height: 3, width: i === wtIdx ? 20 : 7, borderRadius: 999, background: i === wtIdx ? "var(--clay)" : "var(--line-strong)", transition: "all 280ms", cursor: "pointer" }} />
        ))}
      </div>
      <div style={{ flex: 1 }} />
      {wtIdx < 2 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn btn-primary btn-block" onClick={() => setWtIdx(wtIdx + 1)}>
            Next <Icon name="fwd" size={16} color="currentColor" />
          </button>
          <button className="btn btn-soft btn-block" onClick={() => setStep(1)} style={{ fontSize: 13 }}>
            Skip intro
          </button>
        </div>
      ) : (
        <button className="btn btn-primary btn-block" onClick={() => setStep(1)}>
          Get started <Icon name="fwd" size={16} color="currentColor" />
        </button>
      )}
      <div style={{ textAlign: "center", marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>
        Already have an account?{" "}
        <a href="/signin" style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "none" }}>Sign in</a>
      </div>
    </div>,

    // ── slide 1: email + password ──
    <div key="p" className="screen-enter" style={{ padding:"230px 22px 28px", display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="row" style={{ marginBottom:18, marginTop:-200 }}>
        <RoundBtn onClick={() => setStep(0)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height:170 }} />
      <div className="h2" style={{ marginBottom:8 }}>Create your account</div>
      <p style={{ color:"var(--ink-2)", fontSize:14, margin:"0 0 20px" }}>Use an email you check regularly.</p>

      {/* Email */}
      <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:14, padding:"13px 16px", marginBottom:10 }}>
        <input type="email" inputMode="email" autoComplete="email" value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          placeholder="your@email.com"
          style={{ width:"100%", border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)" }} />
      </div>

      {/* Password */}
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
        <button className="btn btn-primary btn-block"
          disabled={!email.includes("@") || password.length < 8 || busy}
          style={{ opacity: !email.includes("@") || password.length < 8 || busy ? 0.45 : 1 }}
          onClick={async () => {
            setBusy(true); setError("");
            try {
              if (window.MM_AUTH) await window.MM_AUTH.signUpWithPassword(email, password);
              setStep(2); // go to name step (step index shifted — no OTP step)
            } catch (e) {
              setError(e.message?.includes("already") ? "Email already registered. Sign in instead." : (e.message || "Something went wrong."));
            }
            setBusy(false);
          }}>
          {busy ? "Creating account…" : "Continue →"}
        </button>
        <button onClick={() => window.MM_AUTH?.signInWithGoogle("investor")}
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
      <div className="h2" style={{ marginBottom:8 }}>Who should we welcome?</div>
      <p style={{ color:"var(--ink-2)", fontSize:14, margin:"0 0 20px" }}>
        Your name and a username others can find you by.
      </p>

      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="Full name  e.g. Femi Adesanya"
        style={{ border:"1px solid var(--line-strong)", background:"var(--bone)", borderRadius:14, padding:"14px 18px", fontFamily:"inherit", fontSize:15, color:"var(--ink)", outline:"none", width:"100%", marginBottom:10 }} />

      <div style={{ border:"1px solid var(--line-strong)", background:"var(--bone)", borderRadius:14, padding:"14px 18px", display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        <span style={{ fontSize:14, color:"var(--ink-3)", fontWeight:500 }}>@</span>
        <input value={username}
          onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"")); setUsernameErr(""); }}
          placeholder="username  e.g. femiadesa"
          style={{ flex:1, border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)" }} />
      </div>
      <p style={{ fontSize:12, color:"var(--ink-3)", margin:"0 0 14px" }}>Lowercase letters, numbers, underscores only</p>
      {usernameErr && <p style={{ fontSize:13, color:"var(--clay)", margin:"-8px 0 10px" }}>{usernameErr}</p>}
      {error && <p style={{ fontSize:13, color:"var(--clay)", margin:"0 0 10px" }}>{error}</p>}

      <div style={{ flex:1 }} />
      <button className="btn btn-primary btn-block"
        disabled={!name || username.length < 3 || busy}
        style={{ opacity: !name || username.length < 3 || busy ? 0.45 : 1 }}
        onClick={async () => {
          setBusy(true);
          try {
            await window.MM_AUTH.saveProfile({ name, username, role:"investor" });
            onDone({ name, username });
          } catch (e) {
            if (e.message?.includes("unique") || e.message?.includes("duplicate")) {
              setUsernameErr("That username is taken. Try another.");
            } else {
              setError(e.message || "Something went wrong.");
            }
          }
          setBusy(false);
        }}>
        {busy ? "Saving…" : "Enter MonieMatch →"}
      </button>
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
        {slides.map((_, i) =>
          <div key={i} style={{
            height: 3, width: i === step ? 22 : 8,
            background: i === step ? "var(--clay)" : "var(--line-strong)",
            borderRadius: 999, transition: "all 320ms"
          }} />
        )}
      </div>
    </div>
  );
}


Object.assign(window, { InvOnboarding });