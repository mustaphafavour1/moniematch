// biz-onboarding.jsx — Business owner onboarding flow (splash slides, email, OTP, business setup)

function BizOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);  // 6-digit
  const [name, setName] = useState("");
  const [bizName, setBizName] = useState("");
  const [category, setCategory] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const emailRef = useRef("");

  const [otpError, setOtpError]         = React.useState("");
  const [otpVerifying, setOtpVerifying] = React.useState(false);

  // Verify OTP — only advance on success
  useEffect(() => {
    if (step === 2 && otp.every(d => d !== "") && !otpVerifying) {
      const t = setTimeout(async () => {
        setOtpError("");
        setOtpVerifying(true);
        try {
          if (window.MM_AUTH) {
            await window.MM_AUTH.verifyEmailOTP(emailRef.current, otp.join(""));
          }
          setOtpVerifying(false);
          setStep(3);
        } catch (e) {
          setOtpVerifying(false);
          setOtp(["","","","","",""]);
          setOtpError("Wrong code or expired. Try again.");
        }
      }, 380);
      return () => clearTimeout(t);
    }
  }, [otp, step]);

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

    // ── slide 1: email ──
    <div key="p" className="screen-enter" style={{ padding:"230px 22px 28px", display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="row" style={{ marginBottom:18, marginTop:-200 }}>
        <RoundBtn onClick={() => setStep(0)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height:170 }} />
      <div className="h2" style={{ marginBottom:8 }}>What's your email?</div>
      <p style={{ color:"var(--ink-2)", fontSize:14, margin:"0 0 24px" }}>We'll send you a 6-digit sign-in code.</p>
      <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:16, padding:"14px 16px" }}>
        <input type="email" inputMode="email" autoComplete="email"
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width:"100%", border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:16, color:"var(--ink)" }} />
      </div>
      <div style={{ flex:1 }} />
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        <button className="btn btn-forest btn-block"
          disabled={!email.includes("@") || !email.includes(".") || otpSending}
          style={{ opacity: !email.includes("@") || otpSending ? 0.45 : 1 }}
          onClick={async () => {
            setOtpSending(true);
            try {
              if (window.MM_AUTH) {
                emailRef.current = await window.MM_AUTH.sendEmailOTP(email);
              }
              setStep(2);
            } catch (e) {
              alert("Couldn't send code: " + (e.message || "Try again"));
            }
            setOtpSending(false);
          }}>
          {otpSending ? "Sending…" : "Send code →"}
        </button>
        <button onClick={() => window.MM_AUTH?.signInWithGoogle("business_owner")}
          style={{ width:"100%", padding:"13px 16px", border:"1.5px solid var(--line-strong)", borderRadius:14, background:"var(--bone)", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, color:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </div>
    </div>,

    // ── slide 2: email OTP (6 digits) ──
    <div key="o" className="screen-enter" style={{ padding:"230px 22px 28px", display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="row" style={{ marginBottom:18, marginTop:-200 }}>
        <RoundBtn onClick={() => { setStep(1); setOtp(["","","","","",""]); setOtpError(""); }}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height:170 }} />
      <div className="h2" style={{ marginBottom:8 }}>Check your email</div>
      <p style={{ color:"var(--ink-2)", fontSize:14, margin:"0 0 28px" }}>
        We sent a 6-digit code to <b style={{ color:"var(--ink)" }}>{email}</b>
      </p>
      <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
        {otp.map((d, i) => (
          <input key={i} ref={otpRefs[i]} value={d} maxLength={1}
            inputMode="numeric" disabled={otpVerifying}
            onChange={e => {
              const val = e.target.value.replace(/\D/g,"");
              const next = [...otp]; next[i] = val; setOtp(next);
              if (val && i < 5) otpRefs[i+1].current?.focus();
            }}
            onKeyDown={e => {
              if (e.key === "Backspace" && !d && i > 0) otpRefs[i-1].current?.focus();
            }}
            style={{ width:44, height:56, flexShrink:0, textAlign:"center",
                     fontFamily:"var(--font-display)", fontSize:26,
                     color: otpError ? "var(--clay)" : "var(--ink)",
                     border:`1.5px solid ${otpError ? "var(--clay)" : d ? "var(--forest)" : "var(--line-strong)"}`,
                     background: otpVerifying ? "rgba(31,26,20,0.04)" : "var(--bone)",
                     borderRadius:12, outline:"none", opacity: otpVerifying ? 0.6 : 1,
                     WebkitAppearance:"none" }} />
        ))}
      </div>
      {otpError && <p style={{ fontSize:13, color:"var(--clay)", margin:"12px 0 0", fontWeight:500 }}>{otpError}</p>}
      {otpVerifying && <p style={{ fontSize:13, color:"var(--ink-3)", margin:"12px 0 0" }}>Verifying…</p>}
      <p style={{ fontSize:13, color:"var(--ink-3)", margin:"16px 0 0" }}>
        Didn't get it?{" "}
        <span style={{ color:"var(--forest)", fontWeight:500, cursor:"pointer" }}
          onClick={() => { setOtp(["","","","","",""]); setOtpError(""); setStep(1); }}>
          Resend code
        </span>
        {" · "}
        <span style={{ color:"var(--ink-3)" }}>Check spam folder</span>
      </p>
      <div style={{ flex:1 }} />
    </div>,

    // ── slide 3: name ──
    <div key="n" className="screen-enter" style={{ padding: "230px 22px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="row" style={{ marginBottom: 18, marginTop: -200 }}>
        <RoundBtn onClick={() => setStep(2)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height: 170 }} />
      <div className="h2" style={{ marginBottom: 8 }}>What's your name?</div>
      <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 24px" }}>This is what investors see first.</p>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aisha Bello"
             style={{ border: "1px solid var(--line-strong)", background: "var(--bone)", borderRadius: 16, padding: "16px 18px", fontFamily: "inherit", fontSize: 16, color: "var(--ink)", outline: "none", width: "100%" }} />
      <div style={{ flex: 1 }} />
      <button className="btn btn-forest btn-block"
        disabled={!name}
        style={{ opacity: !name ? 0.45 : 1 }}
        onClick={() => setStep(4)}>
        Continue
      </button>
    </div>,

    // ── slide 4: business quick capture ──
    <div key="b" className="screen-enter" style={{ padding: "230px 22px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="row between" style={{ marginBottom: 18, marginTop: -200 }}>
        <RoundBtn onClick={() => setStep(3)}><Icon name="back" size={18} /></RoundBtn>
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
              if (window.MM_AUTH) {
                await window.MM_AUTH.saveProfile({ name: userData.name, role: "business_owner" });
                await window.MM_AUTH.saveBusinessProfile({ name: userData.bizName, category: userData.category });
              }
            } catch (e) {
              console.warn("[MM] save biz profile failed:", e.message);
            }
            onDone(userData);
          }}>
          Save and explore
        </button>
        {/* ── PATCH 3b: skip just saves user profile without business details ── */}
        <button className="btn btn-soft btn-block"
          onClick={async () => {
            const userData = { name: name || "Aisha Bello", bizName: "Layi Bakehouse", category: "Bakery" };
            try {
              if (window.MM_AUTH) {
                await window.MM_AUTH.saveProfile({ name: userData.name, role: "business_owner" });
              }
            } catch (e) {
              console.warn("[MM] save profile (skip) failed:", e.message);
            }
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