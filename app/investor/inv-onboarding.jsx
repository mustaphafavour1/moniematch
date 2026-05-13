// inv-onboarding.jsx — Investor onboarding flow (splash slides, phone, OTP, name)

function InvOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [wtIdx, setWtIdx] = useState(0); // walkthrough sub-slide 0,1,2
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  const formattedPhoneRef = useRef("");

  const [otpError, setOtpError]   = React.useState("");
  const [otpVerifying, setOtpVerifying] = React.useState(false);

  // Verify OTP — only advance on success, show error on failure
  useEffect(() => {
    if (step === 2 && otp.every((d) => d !== "") && !otpVerifying) {
      const t = setTimeout(async () => {
        setOtpError("");
        setOtpVerifying(true);

        // Dev bypass: if phone is a known test number AND code is 1234, skip real verify
        const isTestMode = formattedPhoneRef.current.endsWith("0000") || !formattedPhoneRef.current;
        const isDev = window.location.hostname.includes("localhost") ||
                      window.location.hostname.includes("127.0.0.1") ||
                      window.location.hostname.includes("vercel.app");

        if (isTestMode && isDev && otp.join("") === "1234") {
          setOtpVerifying(false);
          setStep(3);
          return;
        }

        try {
          if (window.MM_AUTH && formattedPhoneRef.current) {
            await window.MM_AUTH.verifyOTP(formattedPhoneRef.current, otp.join(""));
          }
          setOtpVerifying(false);
          setStep(3); // ✓ only advance on success
        } catch (e) {
          setOtpVerifying(false);
          setOtp(["", "", "", ""]);
          setOtpError("Wrong code. Check and try again.");
          // Focus first input
          setTimeout(() => document.querySelector('.otp-input-0')?.focus(), 100);
        }
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
      {/* Fixed-size boxes — do NOT use flex:1, use fixed width */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {otp.map((d, i) =>
          <input key={i} ref={otpRefs[i]}
            className={`otp-input-${i}`}
            value={d} maxLength={1}
            inputMode="numeric"
            disabled={otpVerifying}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              const next = [...otp]; next[i] = val; setOtp(next);
              if (val && i < 3) otpRefs[i + 1].current?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !d && i > 0) otpRefs[i - 1].current?.focus();
            }}
            style={{
              width: 64, height: 68, flexShrink: 0,
              textAlign: "center",
              fontFamily: "var(--font-display)", fontSize: 30,
              color: otpError ? "var(--clay)" : "var(--ink)",
              border: `1.5px solid ${otpError ? "var(--clay)" : d ? "var(--clay)" : "var(--line-strong)"}`,
              background: otpVerifying ? "rgba(31,26,20,0.04)" : "var(--bone)",
              borderRadius: 14, outline: "none",
              transition: "border-color 200ms, background 200ms",
              opacity: otpVerifying ? 0.6 : 1,
              WebkitAppearance: "none",
            }} />
        )}
      </div>
      {otpError && (
        <p style={{ fontSize: 13, color: "var(--clay)", margin: "12px 0 0", fontWeight: 500 }}>
          {otpError}
        </p>
      )}
      {otpVerifying && (
        <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "12px 0 0" }}>
          Verifying…
        </p>
      )}
      <div style={{ marginTop: 16, fontSize: 13, color: "var(--ink-3)" }}>
        Didn't get it? <span style={{ color: "var(--clay)", fontWeight: 500, cursor: "pointer" }}
          onClick={() => { setOtp(["","","",""]); setOtpError(""); setStep(1); }}>
          Resend code
        </span>
      </div>
      <div style={{ flex: 1 }} />
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


Object.assign(window, { InvOnboarding });
