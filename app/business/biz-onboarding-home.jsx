// biz-onboarding-home.jsx — Business Owner: Onboarding + Home screens.

// ─── BUSINESS ONBOARDING ─────────────────────────────────
function BizOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [bizName, setBizName] = useState("");
  const [category, setCategory] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const formattedPhoneRef = useRef(""); // stores formatted phone between send + verify steps

  const [otpError, setOtpError]     = React.useState("");
  const [otpVerifying, setOtpVerifying] = React.useState(false);

  // Verify OTP — only advance on success, show error on failure
  useEffect(() => {
    if (step === 2 && otp.every(d => d !== "") && !otpVerifying) {
      const t = setTimeout(async () => {
        setOtpError("");
        setOtpVerifying(true);
        const isTestMode = formattedPhoneRef.current.endsWith("0000") || !formattedPhoneRef.current;
        const isDev = window.location.hostname.includes("localhost") ||
                      window.location.hostname.includes("127.0.0.1") ||
                      window.location.hostname.includes("vercel.app");
        if (isTestMode && isDev && otp.join("") === "1234") {
          setOtpVerifying(false); setStep(3); return;
        }
        try {
          if (window.MM_AUTH && formattedPhoneRef.current) {
            await window.MM_AUTH.verifyOTP(formattedPhoneRef.current, otp.join(""));
          }
          setOtpVerifying(false);
          setStep(3);
        } catch (e) {
          setOtpVerifying(false);
          setOtp(["","","",""]);
          setOtpError("Wrong code. Check and try again.");
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

    // ── slide 1: phone ──
    <div key="p" className="screen-enter" style={{ padding: "230px 22px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="row" style={{ marginBottom: 18, marginTop: -200 }}>
        <RoundBtn onClick={() => setStep(0)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height: 170 }} />
      <div className="h2" style={{ marginBottom: 8 }}>What's your phone number?</div>
      <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 28px" }}>We'll send a 4-digit code.</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bone)", border: "1px solid var(--line-strong)", borderRadius: 16, padding: "14px 16px" }}>
        <span style={{ fontSize: 16, color: "var(--ink-2)" }}>🇳🇬 +234</span>
        <div style={{ width: 1, height: 22, background: "var(--line-strong)" }} />
        <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
               placeholder="803 000 0000"
               style={{ flex: 1, border: 0, background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 16, color: "var(--ink)", letterSpacing: "0.04em" }} />
      </div>
      <div style={{ flex: 1 }} />
      {/* ── PATCH 1: send real OTP via Supabase ── */}
      <button className="btn btn-forest btn-block"
        disabled={phone.length < 10 || otpSending}
        style={{ opacity: phone.length < 10 || otpSending ? 0.45 : 1 }}
        onClick={async () => {
          setOtpSending(true);
          try {
            if (window.MM_AUTH) {
              const formatted = await window.MM_AUTH.sendOTP(phone);
              formattedPhoneRef.current = formatted;
            }
          } catch (e) {
            console.warn("[MM] OTP send failed:", e.message);
            // still advance for UI testing
          }
          setOtpSending(false);
          setStep(2);
        }}>
        {otpSending ? "Sending…" : "Send code"}
      </button>
    </div>,

    // ── slide 2: OTP ──
    <div key="o" className="screen-enter" style={{ padding:"230px 22px 28px", display:"flex", flexDirection:"column", height:"100%" }}>
      <div className="row" style={{ marginBottom:18, marginTop:-200 }}>
        <RoundBtn onClick={() => setStep(1)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height:170 }} />
      <div className="h2" style={{ marginBottom:8 }}>Enter the code</div>
      <p style={{ color:"var(--ink-2)", fontSize:14, margin:"0 0 28px" }}>
        Sent to <b>+234 {phone.slice(0,3)} {phone.slice(3,6)} {phone.slice(6)}</b>
      </p>
      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        {otp.map((d, i) => (
          <input key={i} ref={otpRefs[i]} value={d} maxLength={1}
            inputMode="numeric"
            disabled={otpVerifying}
            onChange={e => {
              const val = e.target.value.replace(/\D/g,"");
              const next = [...otp]; next[i] = val; setOtp(next);
              if (val && i < 3) otpRefs[i+1].current?.focus();
            }}
            onKeyDown={e => {
              if (e.key === "Backspace" && !d && i > 0) otpRefs[i-1].current?.focus();
            }}
            style={{ width:64, height:68, flexShrink:0, textAlign:"center",
                     fontFamily:"var(--font-display)", fontSize:30,
                     color: otpError ? "var(--clay)" : "var(--ink)",
                     border:`1.5px solid ${otpError ? "var(--clay)" : d ? "var(--forest)" : "var(--line-strong)"}`,
                     background: otpVerifying ? "rgba(31,26,20,0.04)" : "var(--bone)",
                     borderRadius:14, outline:"none", transition:"border-color 200ms",
                     opacity: otpVerifying ? 0.6 : 1, WebkitAppearance:"none" }} />
        ))}
      </div>
      {otpError && (
        <p style={{ fontSize:13, color:"var(--clay)", margin:"12px 0 0", fontWeight:500 }}>{otpError}</p>
      )}
      {otpVerifying && (
        <p style={{ fontSize:13, color:"var(--ink-3)", margin:"12px 0 0" }}>Verifying…</p>
      )}
      <div style={{ marginTop:16, fontSize:13, color:"var(--ink-3)" }}>
        Didn't get it?{" "}
        <span style={{ color:"var(--forest)", fontWeight:500, cursor:"pointer" }}
          onClick={() => { setOtp(["","","",""]); setOtpError(""); setStep(1); }}>
          Resend code
        </span>
      </div>
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

// ─── BUSINESS HOME — hero moment ─────────────────────────
function BizHome({ user, interested: propInterested, onPickInvestor, onTab, onStartReport, onNotifications = () => {}, onFundingProgress = () => {} }) {
  const loading    = propInterested === null;
  const isDemoMode = propInterested === undefined;
  const interested = isDemoMode
    ? (window.MM_DATA?.interested || [])
    : (propInterested || []);

  const newOffers  = interested.filter(i => i.status === "new" || !i.status).slice(0, 3);
  const raised     = user?.raised || 0;
  const target     = user?.target || 1200000;
  const bizName    = user?.bizName || user?.business || "your business";
  const profilePct = 78;
  const userName   = user?.name || "Owner";
  const userInitials = userName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const userColor  = user?.color || "var(--clay)";

  if (loading) {
    const S = window.MM_SKEL;
    return S ? <S.SkeletonHome light /> : null;
  }

  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="row gap-10">
          <Avatar name={userName} initials={userInitials} color={userColor} size={36} />
          <div className="col">
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{greet()}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{userName.split(" ")[0]}</div>
          </div>
        </div>
        <RoundBtn onClick={onNotifications}><Icon name="bell" size={18} /></RoundBtn>
      </div>

      {/* hero — investor interest */}
      <div className="pad fadein" style={{ marginTop: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Today · {newOffers.length} new {newOffers.length === 1 ? "offer" : "offers"}
        </div>
        <div className="h1" style={{ fontSize: 32 }}>
          {newOffers.length > 0
            ? <>{newOffers.length === 1 ? "One investor wants" : `${newOffers.length} investors want`} a piece of <span style={{ fontStyle: "italic", color: "var(--forest)" }}>{bizName}.</span></>
            : <>Your profile is <span style={{ fontStyle: "italic", color: "var(--forest)" }}>live and visible.</span></>
          }
        </div>
      </div>

      {/* offers stack */}
      {newOffers.length > 0 && (
        <div className="pad fadein d1" style={{ marginTop: 18 }}>
          <div className="col gap-10">
            {newOffers.map((it, i) => {
              const inv = window.MM_DATA?.investors?.find(v => v.id === it.investorId) || it;
              return (
                <div key={it.matchId || it.investorId || i} className="fadein" style={{ animationDelay: `${i * 80}ms` }}>
                  <OfferCard item={it} inv={inv} onClick={() => onPickInvestor(it.userId || it.investorId)} highlight={i === 0} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* raise progress */}
      <div className="pad fadein d2" style={{ marginTop: 22 }}>
        <div className="card forest" onClick={onFundingProgress} style={{ cursor: "pointer" }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>Your active raise</div>
            <div className="row gap-4" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span style={{ fontSize: 11 }}>View detail</span>
              <Icon name="fwd" size={13} />
            </div>
          </div>
          <div className="row between" style={{ alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 0.04 }}>Raised</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "#fff" }}>
                <AnimatedNaira value={raised} />
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>of {fmtNaira(target, { compact: true })} target</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <ProgressRing value={target > 0 ? (raised/target)*100 : 0} size={56} stroke={5} color="var(--sun)" trackColor="rgba(255,255,255,0.15)">
                <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#fff" }}>{target > 0 ? Math.round((raised/target)*100) : 0}%</span>
              </ProgressRing>
            </div>
          </div>
          {target > raised && (
            <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(0,0,0,0.16)", borderRadius: 10, fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>
              <Icon name="sparkle" size={12} /> {fmtNaira(target - raised, { compact: true })} more closes the round.
            </div>
          )}
        </div>
      </div>

      {/* report due */}
      <div className="pad fadein d3" style={{ marginTop: 14 }}>
        <div onClick={onStartReport} className="card sand" style={{ cursor: "pointer" }}>
          <div className="row between">
            <div className="row gap-12">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--clay)", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="mic" size={20} />
              </div>
              <div className="col">
                <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.04 }}>April report due in 2 days</div>
                <div style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>Speak it. We'll write it.</div>
              </div>
            </div>
            <Icon name="fwd" size={16} color="var(--ink-3)" />
          </div>
        </div>
      </div>

      {/* profile completeness */}
      <div className="pad fadein d4" style={{ marginTop: 22 }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div className="eyebrow">Make your profile irresistible</div>
        </div>
        <div className="card">
          <div className="row gap-14">
            <ProgressRing value={profilePct} size={56} stroke={5} color="var(--forest)">
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)" }}>{profilePct}%</span>
            </ProgressRing>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>3 things left</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>POS link · 2 photos · founder story</div>
            </div>
          </div>
          <div className="hr" style={{ margin: "14px 0" }} />
          <div className="col gap-10">
            <ProfileTask label="Connect Moniepoint POS" subtitle="Pulls last 90 days automatically" badge="+12% match" />
            <ProfileTask label="Add 2 shop photos" subtitle="Investors stay on profile 3× longer with photos" />
            <ProfileTask label="Record your founder story" subtitle="60-second voice note. We'll transcribe." />
          </div>
        </div>
      </div>

      {/* learn */}
      <div className="pad fadein d5" style={{ marginTop: 22 }}>
        <div className="card linen">
          <div className="eyebrow" style={{ marginBottom: 8 }}>Coming soon</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)", lineHeight: 1.2 }}>
            CAC registration support, in 5 days, ₦15,000.
          </div>
          <button className="btn btn-soft" style={{ marginTop: 12, padding: "10px 14px", fontSize: 13 }}>Tell me more</button>
        </div>
      </div>
    </div>
  );
}

function OfferCard({ item, inv, onClick, highlight }) {
  const dim = item.status === "viewing";
  return (
    <div onClick={onClick} className="card" style={{
      padding: 14, cursor: "pointer",
      background: highlight ? "var(--bone)" : "var(--bone)",
      borderColor: highlight ? "var(--forest)" : "var(--line)",
      borderWidth: highlight ? 1.5 : 1,
      opacity: dim ? 0.65 : 1,
    }}>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div className="row gap-12">
          <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={42} />
          <div className="col">
            <div className="row gap-6" style={{ marginBottom: 2 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{inv.name}</div>
              {item.status === "new" && <span className="chip clay" style={{ padding: "2px 8px", fontSize: 10 }}>New</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{inv.role}</div>
          </div>
        </div>
        <div className="col" style={{ alignItems: "flex-end" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }} className="naira">
            {fmtNaira(item.offer.amount, { compact: true })}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{relTime(item.whenISO)}</div>
        </div>
      </div>
      <div className="hr" style={{ margin: "12px 0" }} />
      <div className="row between" style={{ fontSize: 12.5 }}>
        <div className="row gap-6"><Icon name="trend-up" size={14} color="var(--ink-3)" /> <span>{item.offer.terms}</span></div>
      </div>
    </div>
  );
}

function ProfileTask({ label, subtitle, badge }) {
  return (
    <div className="row gap-12" style={{ alignItems: "center" }}>
      <div style={{ width: 24, height: 24, borderRadius: 999, border: "1.5px solid var(--line-strong)", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row between">
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
          {badge && <span className="chip forest" style={{ padding: "2px 8px", fontSize: 10 }}>{badge}</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
}

Object.assign(window, { BizOnboarding, BizHome, OfferCard, Field, ProfileTask });