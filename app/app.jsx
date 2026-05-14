// app.jsx — Root: app shells, screen router, demo chrome.

const { useState, useEffect, useRef, useMemo } = React;

// ─── Demo screen index ────────────────────────────────────
const INVESTOR_SCREENS = [
  { id: "onb",           label: "Onboarding" },
  { id: "home",          label: "Home" },
  { id: "prefsSetup",    label: "Prefs setup" },
  { id: "matches",       label: "Matches" },
  { id: "search",        label: "Search" },
  { id: "biz",           label: "Business detail" },
  { id: "chat",          label: "Chat" },
  { id: "deal",          label: "Deal · sign" },
  { id: "portfolio",     label: "Portfolio" },
  { id: "notifications", label: "Notifications" },
  { id: "matchPrefs",    label: "Match prefs" },
  { id: "dealHistory",   label: "Deal history" },
  { id: "invProfile",    label: "Profile" },
  { id: "requirements",  label: "Requirements" },
  { id: "kyc",           label: "KYC" },
  { id: "referral",      label: "Referral" },
  { id: "settings",      label: "Settings" },
];
const BIZ_SCREENS = [
  { id: "onb",             label: "Onboarding" },
  { id: "home",            label: "Home" },
  { id: "investorDetail",  label: "Investor offer" },
  { id: "chat",            label: "Chat" },
  { id: "dealSign",        label: "Counter-sign · funded" },
  { id: "report",          label: "Report" },
  { id: "reportHistory",   label: "Report history" },
  { id: "investors",       label: "Investors list" },
  { id: "fundingProgress", label: "Funding progress" },
  { id: "notifications",   label: "Notifications" },
  { id: "profileEdit",     label: "Edit profile" },
  { id: "profileLinks",    label: "Links & catalogue" },
  { id: "dealHistory",     label: "Deal history" },
  { id: "documents",       label: "Documents" },
  { id: "kyc",             label: "KYC" },
  { id: "referral",        label: "Referral" },
  { id: "profile",         label: "Profile" },
  { id: "settings",        label: "Settings" },
];

// ─── First-login overlays ─────────────────────────────────

function ChangePasswordOverlay({ onDone }) {
  const [pw, setPw]     = useState("");
  const [pw2, setPw2]   = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");

  const save = async () => {
    if (pw !== pw2) { setErr("Passwords don't match."); return; }
    if (pw.length < 8) { setErr("Must be at least 8 characters."); return; }
    setBusy(true);
    try {
      await window.MM_AUTH.changePassword(pw);
      onDone();
    } catch (e) { setErr(e.message || "Failed. Try again."); }
    setBusy(false);
  };

  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(28,24,19,0.7)", zIndex:9999, display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:"var(--cream)", width:"100%", borderRadius:"24px 24px 0 0", padding:"28px 24px 40px" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:22, color:"var(--ink)", marginBottom:6 }}>Set your password</div>
        <p style={{ fontSize:14, color:"var(--ink-2)", margin:"0 0 20px", lineHeight:1.5 }}>
          This is your first sign-in. Choose a password you'll remember.
        </p>
        <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:12, padding:"12px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
          <input type={show ? "text" : "password"} value={pw} onChange={e => { setPw(e.target.value); setErr(""); }}
            placeholder="New password" style={{ flex:1, border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)" }} />
          <span onClick={() => setShow(s=>!s)} style={{ fontSize:12, color:"var(--ink-3)", cursor:"pointer", fontWeight:500 }}>{show?"Hide":"Show"}</span>
        </div>
        <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:12, padding:"12px 16px", marginBottom:8 }}>
          <input type={show ? "text" : "password"} value={pw2} onChange={e => { setPw2(e.target.value); setErr(""); }}
            placeholder="Confirm password" style={{ width:"100%", border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)" }} />
        </div>
        {err && <p style={{ fontSize:13, color:"var(--clay)", margin:"0 0 10px" }}>{err}</p>}
        <p style={{ fontSize:12, color:"var(--ink-3)", margin:"0 0 16px" }}>At least 8 characters</p>
        <button onClick={save} disabled={!pw || !pw2 || busy}
          style={{ width:"100%", padding:"14px", background:"var(--ink)", color:"var(--cream)", border:"none", borderRadius:12, fontFamily:"inherit", fontSize:15, fontWeight:700, cursor:"pointer", opacity:!pw||!pw2||busy?0.4:1 }}>
          {busy ? "Saving…" : "Set password →"}
        </button>
      </div>
    </div>
  );
}

function RealEmailOverlay({ onDone }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState("");

  const save = async () => {
    if (!email.includes("@") || email.endsWith("@moniematch.app")) {
      setErr("Enter a real email address."); return;
    }
    setBusy(true);
    try {
      // Update auth email + public.users email
      await window.sb.auth.updateUser({ email });
      const { data: { user } } = await window.sb.auth.getUser();
      if (user) {
        await window.sb.from("users").update({ email }).eq("id", user.id);
      }
      onDone();
    } catch (e) { setErr(e.message || "Failed. Try again."); }
    setBusy(false);
  };

  return (
    <div style={{ position:"absolute", inset:0, background:"rgba(28,24,19,0.7)", zIndex:9998, display:"flex", alignItems:"flex-end" }}>
      <div style={{ background:"var(--cream)", width:"100%", borderRadius:"24px 24px 0 0", padding:"28px 24px 40px" }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:22, color:"var(--ink)", marginBottom:6 }}>Add your real email</div>
        <p style={{ fontSize:14, color:"var(--ink-2)", margin:"0 0 20px", lineHeight:1.5 }}>
          We need your real email for password recovery and important updates about your matches.
        </p>
        <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:12, padding:"12px 16px", marginBottom:8 }}>
          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }}
            placeholder="your@email.com" style={{ width:"100%", border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)" }} />
        </div>
        {err && <p style={{ fontSize:13, color:"var(--clay)", margin:"0 0 10px" }}>{err}</p>}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onDone} style={{ flex:1, padding:"14px", background:"transparent", color:"var(--ink-3)", border:"1.5px solid var(--line-strong)", borderRadius:12, fontFamily:"inherit", fontSize:14, cursor:"pointer" }}>
            Skip for now
          </button>
          <button onClick={save} disabled={!email || busy}
            style={{ flex:2, padding:"14px", background:"var(--ink)", color:"var(--cream)", border:"none", borderRadius:12, fontFamily:"inherit", fontSize:15, fontWeight:700, cursor:"pointer", opacity:!email||busy?0.4:1 }}>
            {busy ? "Saving…" : "Save email →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Investor app shell ───────────────────────────────────
function InvestorApp({ initialScreen, tweaks }) {
  const [screen, setScreen]   = useState(initialScreen || "home");
  const [user, setUser]       = useState(null);       // null = loading
  const [matches, setMatches] = useState(null);       // null = loading
  const [tab, setTab]         = useState("home");
  const [activeBiz, setActiveBiz] = useState(null);
  const [loadErr, setLoadErr] = useState(false);
  const [needsRealEmail, setNeedsRealEmail] = useState(false);
  const [needsPwChange, setNeedsPwChange] = useState(false);

  useEffect(() => { if (initialScreen) setScreen(initialScreen); }, [initialScreen]);

  // Load real profile + matches from Supabase on mount
  useEffect(() => {
    if (initialScreen === "onb") {
      setUser({});
      return;
    }
    (async () => {
      try {
        const profile = await window.DB.getMyProfile();
        setUser(profile || {});
        const m = await window.DB.getMyMatches();
        setMatches(m || []);
        // If user signed in with fake email, prompt for real one
        const { data: { user: authUser } } = await window.sb.auth.getUser();
        if (authUser?.email?.endsWith("@moniematch.app")) {
          setNeedsRealEmail(true);
        }
        // If must_change_password, show that too
        if (profile?.must_change_password) {
          setNeedsPwChange(true);
        }
      } catch (e) {
        console.warn("[MM] profile load failed:", e);
        setUser({});
        setMatches([]);
      }
    })();
  }, [initialScreen]);

  const goTab = (t) => {
    setTab(t);
    if (t === "home")      setScreen("home");
    if (t === "matches")   setScreen("matches");
    if (t === "portfolio") setScreen("portfolio");
    if (t === "profile")   setScreen("invProfile");
  };

  const showTabBar = ["home", "matches", "portfolio", "invProfile"].includes(screen);
  const goBack = () => setScreen(
    tab === "home" ? "home" : tab === "matches" ? "matches" : tab === "portfolio" ? "portfolio" : "invProfile"
  );

  const handleSignOut = async () => {
    try { if (window.MM_AUTH) await window.MM_AUTH.signOut(); } catch (e) {}
    setScreen("onb");
    setTab("home");
  };

  // Show splash while profile loads (skip for onboarding)
  if (user === null && screen !== "onb") return <SplashScreen />;

  return (
    <div className="app cream-bg">
      <div className="statusbar-spacer" />

      {/* First-login overlays */}
      {needsPwChange && <ChangePasswordOverlay onDone={() => setNeedsPwChange(false)} />}
      {needsRealEmail && !needsPwChange && <RealEmailOverlay onDone={() => setNeedsRealEmail(false)} />}

      {screen === "onb" && (
        <InvOnboarding onDone={(u) => { setUser({ ...user, ...u }); setScreen("prefsSetup"); setTab("home"); }} />
      )}
      {screen === "home" && tab === "home" && (
        <InvHome
          user={user}
          matches={matches}
          onPickBusiness={(id) => { setActiveBiz(id); setScreen("biz"); }}
          onTab={goTab}
          onNotifications={() => setScreen("notifications")}
        />
      )}
      {screen === "matches" && tab === "matches" && (
        <InvMatches
          matches={matches}
          onPickBusiness={(id) => { setActiveBiz(id); setScreen("biz"); }}
        />
      )}
      {screen === "portfolio" && tab === "portfolio" && (
        <InvPortfolio onPickPosition={() => setScreen("portfolio")} />
      )}
      {screen === "invProfile" && tab === "profile" && (
        <InvProfile
          user={user}
          onEditPrefs={() => setScreen("matchPrefs")}
          onSettings={() => setScreen("settings")}
          onDealHistory={() => setScreen("dealHistory")}
          onSignOut={handleSignOut}
        />
      )}
      {screen === "biz" && (
        <InvBusinessDetail
          bizId={activeBiz}
          onBack={goBack}
          onInvest={() => setScreen("deal")}
          onReports={() => setScreen("reportsReceived")}
          onChat={() => setScreen("chat")}
        />
      )}
      {screen === "deal" && (
        <InvDeal bizId={activeBiz} onBack={() => setScreen("biz")} onComplete={() => { setTab("portfolio"); setScreen("portfolio"); }} />
      )}
      {screen === "counterOffer" && (
        <CounterOffer
          role="investor"
          onBack={() => setScreen("biz")}
          onAccept={() => setScreen("deal")}
          onDecline={() => setScreen("biz")}
        />
      )}
      {screen === "notifications" && (
        <InvNotifications onBack={goBack} />
      )}
      {screen === "settings" && (
        <InvSettings user={user} onBack={() => setScreen("invProfile")} onSignOut={handleSignOut} />
      )}
      {screen === "matchPrefs" && (
        <InvMatchPrefs user={user} onBack={goBack} onSave={(u) => { setUser({ ...user, ...u }); goBack(); }} />
      )}
      {screen === "dealHistory" && (
        <InvDealHistory onBack={() => setScreen("invProfile")} />
      )}
      {screen === "chat" && activeBiz && (
        <MatchChat
          matchId={activeBiz?.matchId}
          currentUser={user}
          otherParty={activeBiz}
          onBack={() => setScreen("biz")}
        />
      )}
      {screen === "requirements" && (
        <InvRequirements user={user} onBack={() => setScreen("invProfile")}
          onSave={r => { setUser({...user, requirements:r}); setScreen("invProfile"); }} />
      )}
      {screen === "reportsReceived" && (
        <InvReportsReceived bizId={activeBiz} onBack={() => setScreen("biz")} />
      )}
      {screen === "prefsSetup" && (
        <InvPrefsSetup user={user} onDone={(prefs) => { setUser({...user,...prefs}); setScreen("home"); }} />
      )}
      {screen === "kyc" && (
        <KYCScreen role="investor" onBack={goBack} onVerified={() => setScreen("invProfile")} />
      )}
      {screen === "search" && (
        <InvSearch onPickBusiness={(id) => { setActiveBiz(id); setScreen("biz"); }} onBack={() => setScreen("matches")} />
      )}
      {screen === "referral" && (
        <ReferralScreen user={user} role="investor" onBack={goBack} />
      )}

      {showTabBar && <TabBar active={tab} onChange={goTab} variant="investor" />}
    </div>
  );
}

// ─── Business app shell ───────────────────────────────────
function BusinessApp({ initialScreen, tweaks }) {
  const [screen, setScreen]       = useState(initialScreen || "home");
  const [user, setUser]           = useState(null);
  const [interested, setInterested] = useState(null);
  const [tab, setTab]             = useState("home");
  const [activeInv, setActiveInv] = useState(null);
  const [needsRealEmail, setNeedsRealEmail] = useState(false);
  const [needsPwChange, setNeedsPwChange]   = useState(false);

  useEffect(() => { if (initialScreen) setScreen(initialScreen); }, [initialScreen]);

  useEffect(() => {
    if (initialScreen === "onb") { setUser({}); return; }
    (async () => {
      try {
        const profile = await window.DB.getMyProfile();
        setUser(profile || {});
        const inv = await window.DB.getInterestedInvestors();
        setInterested(inv || []);
        const { data: { user: authUser } } = await window.sb.auth.getUser();
        if (authUser?.email?.endsWith("@moniematch.app")) setNeedsRealEmail(true);
        if (profile?.must_change_password) setNeedsPwChange(true);
      } catch (e) {
        console.warn("[MM] biz profile load failed:", e);
        setUser({});
        setInterested([]);
      }
    })();
  }, [initialScreen]);

  const goTab = (t) => {
    setTab(t);
    if (t === "home")      setScreen("home");
    if (t === "investors") setScreen("investors");
    if (t === "profile")   setScreen("profile");
    if (t === "report")    setScreen("report");
  };

  const showTabBar = ["home", "investors", "profile"].includes(screen);
  const goBack = () => setScreen(tab === "home" ? "home" : tab === "investors" ? "investors" : "profile");

  const handleSignOut = async () => {
    try { if (window.MM_AUTH) await window.MM_AUTH.signOut(); } catch (e) {}
    setScreen("onb");
    setTab("home");
  };

  if (user === null && screen !== "onb") return <SplashScreen />;

  return (
    <div className="app cream-bg">
      <div className="statusbar-spacer" />

      {needsPwChange && <ChangePasswordOverlay onDone={() => setNeedsPwChange(false)} />}
      {needsRealEmail && !needsPwChange && <RealEmailOverlay onDone={() => setNeedsRealEmail(false)} />}

      {screen === "onb" && (
        <BizOnboarding onDone={(u) => { setUser({ ...user, ...u }); setScreen("home"); setTab("home"); }} />
      )}
      {screen === "home" && tab === "home" && (
        <BizHome
          user={user}
          interested={interested}
          onPickInvestor={(id) => { setActiveInv(id); setScreen("investorDetail"); }}
          onTab={goTab}
          onStartReport={() => setScreen("report")}
          onNotifications={() => setScreen("notifications")}
          onFundingProgress={() => setScreen("fundingProgress")}
        />
      )}
      {screen === "investors" && tab === "investors" && (
        <BizInvestors onPickInvestor={(id) => { setActiveInv(id); setScreen("investorDetail"); }} />
      )}
      {screen === "profile" && tab === "profile" && (
        <BizProfile
          user={user}
          onSettings={() => setScreen("settings")}
          onEditProfile={() => setScreen("profileEdit")}
          onEditLinks={() => setScreen("profileLinks")}
          onDealHistory={() => setScreen("dealHistory")}
          onReportHistory={() => setScreen("reportHistory")}
          onSignOut={handleSignOut}
        />
      )}
      {screen === "investorDetail" && (
        <BizInvestorDetail
          investorId={activeInv}
          onBack={goBack}
          onAccept={() => setScreen("dealSign")}
          onCounter={() => setScreen("counterOffer")}
          onChat={() => setScreen("chat")}
        />
      )}
      {screen === "counterOffer" && (
        <CounterOffer
          role="business"
          onBack={() => setScreen("investorDetail")}
          onAccept={() => setScreen("dealSign")}
          onDecline={() => setScreen("investorDetail")}
        />
      )}
      {screen === "dealSign" && (
        <BizDealSign
          investorId={activeInv}
          onBack={() => setScreen("investorDetail")}
          onComplete={() => { setTab("home"); setScreen("home"); }}
        />
      )}
      {screen === "report" && (
        <BizReporting onBack={() => setScreen("home")} onSent={() => { setTab("home"); setScreen("home"); }} />
      )}
      {screen === "reportHistory" && (
        <BizReportHistory onBack={() => setScreen("profile")} onNewReport={() => setScreen("report")} />
      )}
      {screen === "notifications" && (
        <BizNotifications onBack={goBack} />
      )}
      {screen === "settings" && (
        <BizSettings user={user} onBack={() => setScreen("profile")} onSignOut={handleSignOut} />
      )}
      {screen === "profileEdit" && (
        <BizProfileEdit
          user={user}
          onBack={() => setScreen("profile")}
          onSave={(u) => { setUser({ ...user, ...u }); setScreen("profile"); }}
        />
      )}
      {screen === "fundingProgress" && (
        <BizFundingProgress user={user} onBack={() => setScreen("home")} />
      )}
      {screen === "dealHistory" && (
        <BizDealHistory onBack={() => setScreen("profile")} />
      )}
      {screen === "chat" && activeInv && (
        <MatchChat
          matchId={activeInv?.matchId}
          currentUser={user}
          otherParty={activeInv}
          onBack={() => setScreen("investorDetail")}
        />
      )}
      {screen === "profileLinks" && (
        <BizProfileLinks user={user} onBack={() => setScreen("profile")}
          onSave={l => { setUser({...user, ...l}); setScreen("profile"); }} />
      )}
      {screen === "kyc" && (
        <KYCScreen role="business" onBack={goBack} onVerified={() => setScreen("profile")} />
      )}
      {screen === "documents" && (
        <BizDocuments onBack={() => setScreen("profile")} />
      )}
      {screen === "referral" && (
        <ReferralScreen user={user} role="business" onBack={goBack} />
      )}

      {showTabBar && <TabBar active={tab} onChange={goTab} variant="business" />}
    </div>
  );
}

// ─── Tab bar ─────────────────────────────────────────────
function TabBar({ active, onChange, variant }) {
  const tabs = variant === "investor"
    ? [
        { id: "home",      label: "Home",      icon: "home" },
        { id: "matches",   label: "Matches",   icon: "match" },
        { id: "portfolio", label: "Portfolio", icon: "chart" },
        { id: "profile",   label: "Me",        icon: "user" },
      ]
    : [
        { id: "home",      label: "Home",      icon: "home" },
        { id: "investors", label: "Investors", icon: "match" },
        { id: "profile",   label: "Profile",   icon: "user" },
      ];

  return (
    <div style={{
      borderTop: "1px solid var(--line)",
      background: "var(--cream-tab)",
      backdropFilter: "blur(20px)",
      paddingBottom: 18,
    }}>
      <div className="row" style={{ justifyContent: "space-around", padding: "10px 8px 4px" }}>
        {tabs.map(t => {
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              style={{
                appearance: "none", background: "transparent", border: 0, cursor: "pointer",
                padding: "6px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                color: on ? "var(--forest)" : "var(--ink-3)",
                transition: "color 200ms",
              }}>
              <Icon name={t.icon} size={22} fill={on} stroke={on ? 0 : 1.7} />
              <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500, letterSpacing: 0.02 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Demo chrome (switcher + screen jumper) ───────────────
function DemoChrome({ app, screen, onAppChange, onScreenChange }) {
  const screens = app === "investor" ? INVESTOR_SCREENS : BIZ_SCREENS;
  return (
    <div style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 90,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "auto",
    }}>
      <div style={{
        display: "flex", gap: 4, padding: 4,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
        border: "1px solid rgba(0,0,0,0.06)", borderRadius: 999,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}>
        <DemoTab on={app === "investor"} onClick={() => onAppChange("investor")} accent="#2D5D3F">For Investors</DemoTab>
        <DemoTab on={app === "business"} onClick={() => onAppChange("business")} accent="#B45A3C">For Business Owners</DemoTab>
      </div>
      <div className="row gap-4" style={{ flexWrap: "wrap", justifyContent: "center", maxWidth: 760 }}>
        {screens.map(s => {
          const on = screen === s.id;
          return (
            <button key={s.id} onClick={() => onScreenChange(s.id)}
              style={{
                appearance: "none",
                background: on ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                color: on ? "#fff" : "#333",
                border: "1px solid rgba(0,0,0,0.06)",
                padding: "5px 11px", borderRadius: 999,
                fontSize: 11.5, fontWeight: 500, cursor: "pointer",
                letterSpacing: 0.01, fontFamily: "inherit",
              }}>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DemoTab({ on, onClick, accent, children }) {
  return (
    <button onClick={onClick}
      style={{
        appearance: "none", padding: "8px 16px", borderRadius: 999, border: 0,
        background: on ? accent : "transparent",
        color: on ? "#fff" : "rgba(0,0,0,0.65)",
        fontSize: 12, fontWeight: 600, cursor: "pointer",
        letterSpacing: 0.01, fontFamily: "inherit", transition: "all 220ms",
      }}>
      {children}
    </button>
  );
}

// ─── Tweakable defaults ───────────────────────────────────
const TWEAK_DEFAULTS = {
  "palette": "earth",
  "displayFont": "fraunces",
  "homeLayout": "stack",
  "showDemoChrome": true,
  "matchHero": "cards",
};

const PALETTES = {
  earth:    { forest: "#2D5D3F", clay: "#B45A3C", sun: "#E5A04A", cream: "#F7F1E8" },
  ocean:    { forest: "#1F5F7A", clay: "#C76B4F", sun: "#F0B85C", cream: "#F4F0E8" },
  midnight: { forest: "#3B4A8B", clay: "#A04B6E", sun: "#E4B95C", cream: "#F2EEE5" },
  garden:   { forest: "#3F6B33", clay: "#A85A38", sun: "#E0AB4B", cream: "#F6F2E7" },
};

// ─── Root (demo mode — used at /app) ─────────────────────
function Root() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [app, setApp] = useState("investor");
  const [screen, setScreen] = useState("home");

  useEffect(() => { setScreen("home"); }, [app]);
  useEffect(() => { window.MM_TWEAKS = tweaks; }, [tweaks]);

  useEffect(() => {
    const p = PALETTES[tweaks.palette] || PALETTES.earth;
    const root = document.documentElement;
    root.style.setProperty("--forest", p.forest);
    root.style.setProperty("--clay", p.clay);
    root.style.setProperty("--sun", p.sun);
    root.style.setProperty("--cream", p.cream);
    root.style.setProperty("--forest-tint", hexA(p.forest, 0.12));
    root.style.setProperty("--clay-tint", hexA(p.clay, 0.12));
    root.style.setProperty("--sun-tint", hexA(p.sun, 0.18));
    root.style.setProperty("--cream-tab", hexA(p.cream, 0.85));
  }, [tweaks.palette]);

  useEffect(() => {
    const fonts = {
      fraunces:    '"Fraunces", "EB Garamond", Georgia, serif',
      playfair:    '"Playfair Display", "EB Garamond", Georgia, serif',
      sourceSerif: '"Source Serif 4", "EB Garamond", Georgia, serif',
      dmSerif:     '"DM Serif Display", "EB Garamond", Georgia, serif',
    };
    document.documentElement.style.setProperty("--font-display", fonts[tweaks.displayFont] || fonts.fraunces);
  }, [tweaks.displayFont]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "92px 20px 60px", gap: 24, position: "relative",
    }}>
      {tweaks.showDemoChrome && (
        <DemoChrome app={app} screen={screen} onAppChange={setApp} onScreenChange={setScreen} />
      )}

      <IOSDevice width={402} height={874}>
        {app === "investor" ? (
          <InvestorApp key={"inv-" + screen} initialScreen={screen} tweaks={tweaks} />
        ) : (
          <BusinessApp key={"biz-" + screen} initialScreen={screen} tweaks={tweaks} />
        )}
      </IOSDevice>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Palette">
          <TweakSelect label="Color theme" value={tweaks.palette}
            onChange={v => setTweak("palette", v)}
            options={[
              { value: "earth",    label: "Earth (default)" },
              { value: "ocean",    label: "Ocean" },
              { value: "midnight", label: "Midnight" },
              { value: "garden",   label: "Garden" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Typography">
          <TweakSelect label="Display font" value={tweaks.displayFont}
            onChange={v => setTweak("displayFont", v)}
            options={[
              { value: "fraunces",    label: "Fraunces" },
              { value: "playfair",    label: "Playfair Display" },
              { value: "sourceSerif", label: "Source Serif 4" },
              { value: "dmSerif",     label: "DM Serif Display" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Layout variants">
          <TweakRadio label="Investor home" value={tweaks.homeLayout}
            onChange={v => setTweak("homeLayout", v)}
            options={[
              { value: "stack", label: "Stack" },
              { value: "grid",  label: "Grid" },
            ]}
          />
          <TweakRadio label="Match hero" value={tweaks.matchHero}
            onChange={v => setTweak("matchHero", v)}
            options={[
              { value: "cards", label: "Cards" },
              { value: "list",  label: "List" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Demo">
          <TweakToggle label="App/screen switcher" value={tweaks.showDemoChrome}
                       onChange={v => setTweak("showDemoChrome", v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// hex → rgba helper
function hexA(hex, a) {
  const m = hex.replace("#", "");
  const n = m.length === 3 ? m.split("").map(x => x+x).join("") : m;
  const r = parseInt(n.slice(0,2), 16), g = parseInt(n.slice(2,4), 16), b = parseInt(n.slice(4,6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ── URL-based routing ────────────────────────────────────
// /app/investor  → InvestorApp with session check
// /app/business  → BusinessApp with session check
// /app           → Root (demo mode with IOSDevice frame)
// If MM_CUSTOM_MOUNT is true (set by investor/business index.html),
// those pages handle their own mounting — skip this.
(async function mountApp() {
  if (window.MM_CUSTOM_MOUNT) return;
  const path = window.location.pathname;
  const isInvestor = path.includes("/investor");
  const isBusiness = path.includes("/business");

  if (isInvestor || isBusiness) {
    // ── User-facing route: no demo chrome, no IOSDevice frame ──

    // Mark body as app mode (not demo)
    document.body.classList.remove("demo-mode");

    // Apply default palette
    const p = { forest:"#2D5D3F", clay:"#B45A3C", sun:"#E5A04A", cream:"#F7F1E8" };
    const root = document.documentElement;
    root.style.setProperty("--forest",      p.forest);
    root.style.setProperty("--clay",        p.clay);
    root.style.setProperty("--sun",         p.sun);
    root.style.setProperty("--cream",       p.cream);
    root.style.setProperty("--forest-tint", hexA(p.forest, 0.12));
    root.style.setProperty("--clay-tint",   hexA(p.clay, 0.12));
    root.style.setProperty("--sun-tint",    hexA(p.sun, 0.18));
    root.style.setProperty("--cream-tab",   hexA(p.cream, 0.85));
    root.style.setProperty("--font-display", '"Fraunces","EB Garamond",Georgia,serif');
    window.MM_TWEAKS = { palette: "earth", displayFont: "fraunces" };

    // Show splash while checking session
    const appRoot = ReactDOM.createRoot(document.getElementById("root"));
    appRoot.render(React.createElement(SplashScreen));

    // Session check — existing users skip onboarding
    let initialScreen = "onb";
    try {
      if (window.MM_AUTH) {
        const session = await window.MM_AUTH.getSession();
        if (session) initialScreen = "home";
      }
    } catch (e) {
      // No session — start at onboarding
    }

    const App = isInvestor ? InvestorApp : BusinessApp;
    appRoot.render(
      React.createElement(App, { initialScreen, tweaks: window.MM_TWEAKS })
    );

  } else {
    // ── Demo mode at /app ──
    document.body.classList.add("demo-mode");
    ReactDOM.createRoot(document.getElementById("root"))
      .render(React.createElement(Root));
  }
})();