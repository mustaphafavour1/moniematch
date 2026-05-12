// inv-onboarding-home.jsx — Investor: Onboarding + Home screens.

const { byId } = window.MM_DATA;

// ─── INVESTOR ONBOARDING ─────────────────────────────────
function InvOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [wtIdx, setWtIdx] = useState(0); // walkthrough sub-slide 0,1,2
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const formattedPhoneRef = useRef("");

  // ── PATCH 2: verify OTP with Supabase when all 4 digits filled ──
  useEffect(() => {
    if (step === 2 && otp.every((d) => d !== "")) {
      const t = setTimeout(async () => {
        try {
          if (window.MM_AUTH) {
            await window.MM_AUTH.verifyOTP(formattedPhoneRef.current, otp.join(""));
          }
        } catch (e) {
          console.warn("[MM] OTP verify failed:", e.message);
        }
        setStep(3);
      }, 380);
      return () => clearTimeout(t);
    }
  }, [otp, step]);

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

    // ── slide 1: phone ──
    <div key="p" className="screen-enter" style={{ padding: "230px 22px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="row" style={{ marginBottom: 18, marginTop: -200 }}>
        <RoundBtn onClick={() => setStep(0)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height: 170 }} />
      <div className="h2" style={{ marginBottom: 8 }}>What's your phone number?</div>
      <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 28px" }}>We'll send a 4-digit code. Standard rates apply.</p>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--bone)", border: "1px solid var(--line-strong)",
        borderRadius: 16, padding: "14px 16px"
      }}>
        <span style={{ fontSize: 16, color: "var(--ink-2)" }}>🇳🇬 +234</span>
        <div style={{ width: 1, height: 22, background: "var(--line-strong)" }} />
        <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="803 000 0000"
          style={{
            flex: 1, border: 0, background: "transparent", outline: "none",
            fontFamily: "inherit", fontSize: 16, color: "var(--ink)",
            letterSpacing: "0.04em"
          }} />
      </div>
      <div style={{ flex: 1 }} />
      {/* ── PATCH 1: send real OTP via Supabase ── */}
      <button className="btn btn-primary btn-block"
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
    <div key="o" className="screen-enter" style={{ padding: "230px 22px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="row" style={{ marginBottom: 18, marginTop: -200 }}>
        <RoundBtn onClick={() => setStep(1)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height: 170 }} />
      <div className="h2" style={{ marginBottom: 8 }}>Enter the code</div>
      <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 28px" }}>
        Sent to <b>+234 {phone.slice(0, 3)} {phone.slice(3, 6)} {phone.slice(6)}</b>
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
        {otp.map((d, i) =>
          <input key={i} ref={otpRefs[i]} value={d} maxLength={1}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              const next = [...otp]; next[i] = val; setOtp(next);
              if (val && i < 3) otpRefs[i + 1].current?.focus();
            }}
            style={{
              flex: 1, height: 64, textAlign: "center",
              fontFamily: "var(--font-display)", fontSize: 32,
              color: "var(--ink)",
              border: `1.5px solid ${d ? "var(--clay)" : "var(--line-strong)"}`,
              background: "var(--bone)", borderRadius: 16, outline: "none",
              transition: "border-color 200ms"
            }} />
        )}
      </div>
      <div style={{ marginTop: 18, fontSize: 13, color: "var(--ink-3)" }}>
        Didn't get it? <span style={{ color: "var(--clay)", fontWeight: 500 }}>Resend in 24s</span>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-soft" onClick={() => { setOtp(["1", "2", "3", "4"]); }}>
        Auto-fill demo code
      </button>
    </div>,

    // ── slide 3: name ──
    <div key="n" className="screen-enter" style={{ padding: "230px 22px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="row" style={{ marginBottom: 18, marginTop: -200 }}>
        <RoundBtn onClick={() => setStep(2)}><Icon name="back" size={18} /></RoundBtn>
      </div>
      <div style={{ height: 170 }} />
      <div className="h2" style={{ marginBottom: 8 }}>Who should we welcome?</div>
      <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 28px" }}>
        Just your name for now. The full investor profile can wait — we'll surface matches in the meantime.
      </p>
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Femi Adesanya"
        style={{
          border: "1px solid var(--line-strong)", background: "var(--bone)",
          borderRadius: 16, padding: "16px 18px",
          fontFamily: "inherit", fontSize: 16, color: "var(--ink)",
          outline: "none", width: "100%"
        }} />
      <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--sun-tint)", borderRadius: 14,
        display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#7a5210" }}>
        <Icon name="sparkle" size={16} fill />
        <div><b>Skip the long form.</b> You can browse and even bookmark businesses before completing your investor profile.</div>
      </div>
      <div style={{ flex: 1 }} />
      {/* ── PATCH 3: save profile to Supabase before calling onDone ── */}
      <button className="btn btn-primary btn-block"
        disabled={!name}
        style={{ opacity: !name ? 0.45 : 1 }}
        onClick={async () => {
          const userData = { name: name || "Femi Adesanya" };
          try {
            if (window.MM_AUTH) {
              await window.MM_AUTH.saveProfile({ name: userData.name, role: "investor" });
            }
          } catch (e) {
            console.warn("[MM] save investor profile failed:", e.message);
          }
          onDone(userData);
        }}>
        Enter MonieMatch
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

// ─── INVESTOR HOME — the hero moment ─────────────────────
function InvHome({ user, onPickBusiness, onTab }) {
  const matches = window.MM_DATA.matchesToday.map((id) => window.MM_DATA.businesses.find((b) => b.id === id));
  const newThisWeek = window.MM_DATA.newThisWeek.map((id) => window.MM_DATA.businesses.find((b) => b.id === id));

  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      {/* header */}
      <div className="pad" style={{ paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="row gap-10">
          <Avatar name={user.name} initials="FA" color="var(--forest)" size={36} />
          <div className="col">
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{greet()}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{user.name.split(" ")[0]}</div>
          </div>
        </div>
        <RoundBtn><Icon name="bell" size={18} /></RoundBtn>
      </div>

      {/* hero — today's matches headline card */}
      <div className="pad fadein" style={{ marginTop: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10, fontSize: "9px" }}>Today · {matches.length} new matches</div>
        <div className="h1" style={{ fontSize: "28px" }}>
          Two businesses are looking for the kind of capital <span style={{ fontStyle: "italic", color: "var(--clay)", fontSize: "27px" }}>you bring.</span>
        </div>
      </div>

      {/* match carousel */}
      <div className="fadein d1" style={{ marginTop: 18, paddingLeft: 22, overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 12, paddingRight: 22 }}>
          {matches.map((b, i) => <MatchHeroCard key={b.id} biz={b} onClick={() => onPickBusiness(b.id)} index={i} />)}
        </div>
      </div>

      {/* portfolio strip */}
      <div className="pad fadein d2" style={{ marginTop: 22 }}>
        <div className="card ink" onClick={() => onTab("portfolio")} style={{ cursor: "pointer" }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="eyebrow" style={{ color: "rgba(255,252,245,0.55)" }}>Your portfolio</div>
            <div className="row gap-4" style={{ color: "rgba(255,252,245,0.6)" }}>
              <span style={{ fontSize: 12 }}>View</span>
              <Icon name="fwd" size={14} />
            </div>
          </div>
          <div className="row between" style={{ alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,252,245,0.55)", letterSpacing: 0.04 }}>Deployed</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--cream)", lineHeight: 1.05 }}>
                <AnimatedNaira value={2400000} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(255,252,245,0.55)", letterSpacing: 0.04 }}>Avg return</div>
              <div className="row gap-4" style={{ color: "var(--sun)", fontSize: 18, fontWeight: 500, justifyContent: "flex-end" }}>
                <Icon name="trend-up" size={16} /> 11.2%
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
            <div style={{ flex: 7, height: 6, borderRadius: 999, background: "var(--clay)" }} />
            <div style={{ flex: 4, height: 6, borderRadius: 999, background: "var(--sun)" }} />
            <div style={{ flex: 2, height: 6, borderRadius: 999, background: "var(--forest-soft)" }} />
          </div>
          <div className="row between" style={{ fontSize: 11, color: "rgba(255,252,245,0.6)", marginTop: 8 }}>
            <span>Fashion</span><span>Food</span><span>Barbing</span>
          </div>
        </div>
      </div>

      {/* upcoming payout */}
      <div className="pad fadein d3" style={{ marginTop: 14 }}>
        <div className="card sand">
          <div className="row between">
            <div className="row gap-12">
              <Avatar name="Tunde" initials="TO" color="var(--forest)" size={42} />
              <div className="col">
                <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: 0.04, textTransform: "uppercase" }}>Next payout · May 15</div>
                <div style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>Studio Adunni</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>₦92,000</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>est. revenue share</div>
            </div>
          </div>
        </div>
      </div>

      {/* new this week */}
      <div className="pad fadein d4" style={{ marginTop: 24 }}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <div className="eyebrow">New this week</div>
          <div onClick={() => onTab("matches")} style={{ fontSize: 12, color: "var(--clay)", fontWeight: 500, cursor: "pointer" }}>See all</div>
        </div>
        <div className="col gap-10">
          {newThisWeek.map((b) => <MatchListRow key={b.id} biz={b} onClick={() => onPickBusiness(b.id)} />)}
        </div>
      </div>

      {/* profile completion nudge */}
      <div className="pad fadein d5" style={{ marginTop: 22 }}>
        <div style={{
          background: "var(--linen)",
          borderRadius: 20, padding: "16px 18px",
          display: "flex", alignItems: "center", gap: 14,
          border: "1px dashed var(--line-strong)"
        }}>
          <ProgressRing value={20} size={42} stroke={4} color="var(--clay)">
            <span style={{ fontSize: 11, fontFamily: "var(--font-display)", color: "var(--ink)" }}>20%</span>
          </ProgressRing>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>Finish your investor profile</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>3 mins. Lets owners decide faster.</div>
          </div>
          <Icon name="fwd" size={16} color="var(--ink-3)" />
        </div>
      </div>
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Up early";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function MatchHeroCard({ biz, onClick, index = 0 }) {
  return (
    <div onClick={onClick} className="fadein"
      style={{
        width: 260, flexShrink: 0,
        background: "var(--bone)",
        borderRadius: 24, padding: 14,
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--line)",
        cursor: "pointer",
        animationDelay: `${index * 80}ms`
      }}>
      <Photo label={biz.photoLab} height={140} radius={14} color={`${biz.color}15`} accent={
        <div style={{
          background: "var(--bone)", borderRadius: 999, padding: "4px 10px",
          fontSize: 10.5, fontWeight: 500, color: "var(--ink)", boxShadow: "var(--shadow-sm)"
        }}>{biz.matchScore}% match</div>
      } />
      <div style={{ marginTop: 12 }}>
        <div className="row gap-6" style={{ marginBottom: 6 }}>
          <span className="chip" style={{ background: `${biz.color}18`, color: biz.color }}>{biz.category}</span>
          <span className="chip outline">{biz.city}</span>
        </div>
        <div style={{ fontFamily: "var(--font-display)", color: "var(--ink)", lineHeight: 1.1, fontSize: "20px" }}>
          {biz.business}
        </div>
        <div style={{ color: "var(--ink-2)", marginTop: 4, lineHeight: 1.45, fontSize: "11px", margin: "4px 0px 0px" }}>
          {biz.use}
        </div>
        <div className="hr" style={{ margin: "12px 0" }} />
        <div className="row between">
          <div className="col">
            <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: 0.05, textTransform: "uppercase" }}>Raising</div>
            <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }} className="naira">{fmtNairaRange(biz.askMin, biz.askMax)}</div>
          </div>
          <div className="col" style={{ alignItems: "flex-end" }}>
            <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: 0.05, textTransform: "uppercase" }}>Offer</div>
            <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{biz.returnHeadline.split(" · ")[0]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchListRow({ biz, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "var(--bone)", borderRadius: 18, padding: 12,
      display: "flex", alignItems: "center", gap: 12,
      border: "1px solid var(--line)", cursor: "pointer"
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `${biz.color}20`, color: biz.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontSize: 22,
        position: "relative", overflow: "hidden", flexShrink: 0
      }}>
        <span style={{ position: "relative", zIndex: 1 }}>{biz.initials}</span>
        <span style={{ position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(135deg, transparent 0 6px, rgba(31,26,20,0.04) 6px 7px)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row between">
          <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{biz.business}</div>
          <div style={{ fontSize: 11, color: "var(--clay)", fontWeight: 500 }}>{biz.matchScore}%</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {biz.category} · {biz.city} · {biz.returnHeadline.split(" · ")[0]}
        </div>
      </div>
      <Icon name="fwd" size={14} color="var(--ink-3)" />
    </div>
  );
}

Object.assign(window, { InvOnboarding, InvHome, MatchHeroCard, MatchListRow, greet });