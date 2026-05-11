// app.jsx — Root: app switcher, screen router, Tweaks panel, iOS frame.

const { useState, useEffect, useRef, useMemo } = React;

// ─── Demo screen index ───────────────────────────────────
const INVESTOR_SCREENS = [
  { id: "onb", label: "Onboarding" },
  { id: "home", label: "Home" },
  { id: "matches", label: "Matches" },
  { id: "biz", label: "Business detail" },
  { id: "deal", label: "Deal · sign" },
  { id: "portfolio", label: "Portfolio" },
  { id: "investment", label: "Investment detail" },
];
const BIZ_SCREENS = [
  { id: "onb", label: "Onboarding" },
  { id: "home", label: "Home" },
  { id: "investorDetail", label: "Investor offer" },
  { id: "dealSign", label: "Counter-sign · funded" },
  { id: "report", label: "Report" },
  { id: "investors", label: "Investors list" },
  { id: "profile", label: "Profile" },
];

// ─── Investor app shell ─────────────────────────────────
function InvestorApp({ initialScreen, tweaks }) {
  const [screen, setScreen] = useState(initialScreen || "home");
  const [user, setUser] = useState({ name: "Femi Akande", interests: ["Bakery", "Fashion", "Food"], rangeMin: 100000, rangeMax: 1500000, returnGoal: "balanced" });
  const [tab, setTab] = useState("home");
  const [activeBiz, setActiveBiz] = useState("aisha");

  useEffect(() => { if (initialScreen) setScreen(initialScreen); }, [initialScreen]);

  const goTab = (t) => {
    setTab(t);
    if (t === "home") setScreen("home");
    if (t === "matches") setScreen("matches");
    if (t === "portfolio") setScreen("portfolio");
    if (t === "profile") setScreen("invProfile");
  };

  const showTabBar = ["home", "matches", "portfolio", "invProfile"].includes(screen);

  return (
    <div className="app cream-bg">
      <div className="statusbar-spacer" />

      {screen === "onb" && <InvOnboarding onDone={(u) => { setUser({ ...user, ...u }); setScreen("home"); setTab("home"); }} />}

      {screen === "home" && tab === "home" && (
        <InvHome user={user} onPickBiz={(id) => { setActiveBiz(id); setScreen("biz"); }} />
      )}
      {screen === "matches" && tab === "matches" && (
        <InvMatches onPickBiz={(id) => { setActiveBiz(id); setScreen("biz"); }} />
      )}
      {screen === "portfolio" && tab === "portfolio" && (
        <InvPortfolio onOpenInvestment={(id) => { setActiveBiz(id); setScreen("portfolio"); }} />
      )}
      {screen === "invProfile" && tab === "profile" && (
        <InvProfile user={user} />
      )}
      {screen === "biz" && (
        <InvBusinessDetail bizId={activeBiz} onBack={() => setScreen(tab === "matches" ? "matches" : "home")} onInvest={() => setScreen("deal")} />
      )}
      {screen === "deal" && (
        <InvDeal bizId={activeBiz} onBack={() => setScreen("biz")} onComplete={() => { setTab("portfolio"); setScreen("portfolio"); }} />
      )}

      {screen === "notifications" && <InvNotifications onBack={() => setScreen(tab === "home" ? "home" : tab)} />}
      {screen === "settings"      && <InvSettings user={user} onBack={() => setScreen("invProfile")} onSignOut={async () => { await window.MM_AUTH?.signOut(); setScreen("onb"); }} />}
      {screen === "matchPrefs"    && <InvMatchPrefs user={user} onBack={() => setScreen("home")} onSave={u => { setUser({...user,...u}); setScreen("home"); }} />}
      {screen === "dealHistory"   && <InvDealHistory onBack={() => setScreen("portfolio")} />}

      {screen === "investment" && (
        <InvPortfolio onOpenInvestment={() => setScreen("portfolio")} />
      )}

      {showTabBar && <TabBar active={tab} onChange={goTab} variant="investor" />}
    </div>
  );
}

// ─── Business app shell ─────────────────────────────────
function BusinessApp({ initialScreen, tweaks }) {
  const [screen, setScreen] = useState(initialScreen || "home");
  const [user, setUser] = useState({ name: "Aisha Bello", bizName: "Layi Bakehouse", category: "Bakery" });
  const [tab, setTab] = useState("home");
  const [activeInv, setActiveInv] = useState("femi");

  useEffect(() => { if (initialScreen) setScreen(initialScreen); }, [initialScreen]);

  const goTab = (t) => {
    setTab(t);
    if (t === "home") setScreen("home");
    if (t === "investors") setScreen("investors");
    if (t === "profile") setScreen("profile");
    if (t === "report") setScreen("report");
  };

  const showTabBar = ["home", "investors", "profile"].includes(screen);

  return (
    <div className="app cream-bg">
      <div className="statusbar-spacer" />

      {screen === "onb" && <BizOnboarding onDone={(u) => { setUser({ ...user, ...u }); setScreen("home"); setTab("home"); }} />}
      {screen === "home" && tab === "home" && (
        <BizHome user={user}
                 onPickInvestor={(id) => { setActiveInv(id); setScreen("investorDetail"); }}
                 onTab={goTab}
                 onStartReport={() => setScreen("report")} />
      )}
      {screen === "investors" && tab === "investors" && (
        <BizInvestors onPickInvestor={(id) => { setActiveInv(id); setScreen("investorDetail"); }} />
      )}
      {screen === "profile" && tab === "profile" && (
        <BizProfile user={user} />
      )}
      {screen === "investorDetail" && (
        <BizInvestorDetail investorId={activeInv}
                           onBack={() => setScreen(tab === "investors" ? "investors" : "home")}
                           onAccept={() => setScreen("dealSign")} />
      )}
      {screen === "dealSign" && (
        <BizDealSign investorId={activeInv}
                     onBack={() => setScreen("investorDetail")}
                     onComplete={() => { setTab("home"); setScreen("home"); }} />
      )}

      {screen === "notifications"    && <BizNotifications onBack={() => setScreen("home")} />}
      {screen === "settings"         && <BizSettings user={user} onBack={() => setScreen("profile")} onSignOut={async () => { await window.MM_AUTH?.signOut(); setScreen("onb"); }} />}
      {screen === "profileEdit"      && <BizProfileEdit user={user} onBack={() => setScreen("profile")} onSave={u => { setUser({...user,...u}); setScreen("profile"); }} />}
      {screen === "fundingProgress"  && <BizFundingProgress user={user} onBack={() => setScreen("home")} />}
      {screen === "dealHistory"      && <BizDealHistory onBack={() => setScreen("investors")} />}


      {screen === "report" && (
        <BizReporting onBack={() => setScreen("home")} onSent={() => { setTab("home"); setScreen("home"); }} />
      )}

      {showTabBar && <TabBar active={tab} onChange={goTab} variant="business" />}
    </div>
  );
}

// ─── Tab bar ────────────────────────────────────────────
function TabBar({ active, onChange, variant }) {
  const tabs = variant === "investor"
    ? [
        { id: "home", label: "Home", icon: "home" },
        { id: "matches", label: "Matches", icon: "match" },
        { id: "portfolio", label: "Portfolio", icon: "chart" },
        { id: "profile", label: "Me", icon: "user" },
      ]
    : [
        { id: "home", label: "Home", icon: "home" },
        { id: "investors", label: "Investors", icon: "match" },
        { id: "profile", label: "Profile", icon: "user" },
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
              style={{ appearance: "none", background: "transparent", border: 0, cursor: "pointer",
                       padding: "6px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                       color: on ? "var(--forest)" : "var(--ink-3)",
                       transition: "color 200ms" }}>
              <Icon name={t.icon} size={22} fill={on} stroke={on ? 0 : 1.7} />
              <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500, letterSpacing: 0.02 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Demo chrome: app switcher + screen jumper ──────────
function DemoChrome({ app, screen, onAppChange, onScreenChange }) {
  const screens = app === "investor" ? INVESTOR_SCREENS : BIZ_SCREENS;
  return (
    <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 90,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "auto" }}>
      <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
                    border: "1px solid rgba(0,0,0,0.06)", borderRadius: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
        <DemoTab on={app === "investor"} onClick={() => onAppChange("investor")} accent="#2D5D3F">For Investors</DemoTab>
        <DemoTab on={app === "business"} onClick={() => onAppChange("business")} accent="#B45A3C">For Business Owners</DemoTab>
      </div>
      <div className="row gap-4" style={{ flexWrap: "wrap", justifyContent: "center", maxWidth: 760 }}>
        {screens.map(s => {
          const on = screen === s.id;
          return (
            <button key={s.id} onClick={() => onScreenChange(s.id)}
              style={{ appearance: "none", background: on ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.7)",
                       backdropFilter: "blur(12px)",
                       color: on ? "#fff" : "#333",
                       border: "1px solid rgba(0,0,0,0.06)", padding: "5px 11px", borderRadius: 999,
                       fontSize: 11.5, fontWeight: 500, cursor: "pointer", letterSpacing: 0.01,
                       fontFamily: "inherit" }}>
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
      style={{ appearance: "none", padding: "8px 16px", borderRadius: 999, border: 0,
               background: on ? accent : "transparent",
               color: on ? "#fff" : "rgba(0,0,0,0.65)",
               fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.01,
               fontFamily: "inherit", transition: "all 220ms" }}>
      {children}
    </button>
  );
}

// ─── Tweakable defaults (color + layout variants) ───────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "earth",
  "displayFont": "fraunces",
  "homeLayout": "stack",
  "showDemoChrome": true,
  "matchHero": "cards"
}/*EDITMODE-END*/;

const PALETTES = {
  earth:  { forest: "#2D5D3F", clay: "#B45A3C", sun: "#E5A04A", cream: "#F7F1E8" },
  ocean:  { forest: "#1F5F7A", clay: "#C76B4F", sun: "#F0B85C", cream: "#F4F0E8" },
  midnight: { forest: "#3B4A8B", clay: "#A04B6E", sun: "#E4B95C", cream: "#F2EEE5" },
  garden: { forest: "#3F6B33", clay: "#A85A38", sun: "#E0AB4B", cream: "#F6F2E7" },
};

// ─── Root ──────────────────────────────────────────────
function Root() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [app, setApp] = useState("investor");
  const [screen, setScreen] = useState("home");

  // when switching apps, default to home of that app
  useEffect(() => { setScreen("home"); }, [app]);

  // expose tweaks globally
  useEffect(() => { window.MM_TWEAKS = tweaks; }, [tweaks]);

  // apply palette
  useEffect(() => {
    const p = PALETTES[tweaks.palette] || PALETTES.earth;
    const root = document.documentElement;
    root.style.setProperty("--forest", p.forest);
    root.style.setProperty("--clay", p.clay);
    root.style.setProperty("--sun", p.sun);
    root.style.setProperty("--cream", p.cream);
    // tints
    root.style.setProperty("--forest-tint", hexA(p.forest, 0.12));
    root.style.setProperty("--clay-tint", hexA(p.clay, 0.12));
    root.style.setProperty("--sun-tint", hexA(p.sun, 0.18));
    root.style.setProperty("--cream-tab", hexA(p.cream, 0.85));
  }, [tweaks.palette]);

  // apply font
  useEffect(() => {
    const fonts = {
      fraunces: '"Fraunces", "EB Garamond", Georgia, serif',
      playfair: '"Playfair Display", "EB Garamond", Georgia, serif',
      sourceSerif: '"Source Serif 4", "EB Garamond", Georgia, serif',
      dmSerif: '"DM Serif Display", "EB Garamond", Georgia, serif',
    };
    document.documentElement.style.setProperty("--font-display", fonts[tweaks.displayFont] || fonts.fraunces);
  }, [tweaks.displayFont]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "92px 20px 60px", gap: 24, position: "relative" }}>
      {tweaks.showDemoChrome && (
        <DemoChrome app={app} screen={screen}
                    onAppChange={setApp} onScreenChange={setScreen} />
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
              { value: "earth", label: "Earth (default)" },
              { value: "ocean", label: "Ocean" },
              { value: "midnight", label: "Midnight" },
              { value: "garden", label: "Garden" },
            ]}
          />
        </TweakSection>

        <TweakSection title="Typography">
          <TweakSelect label="Display font" value={tweaks.displayFont}
            onChange={v => setTweak("displayFont", v)}
            options={[
              { value: "fraunces", label: "Fraunces" },
              { value: "playfair", label: "Playfair Display" },
              { value: "sourceSerif", label: "Source Serif 4" },
              { value: "dmSerif", label: "DM Serif Display" },
            ]}
          />
        </TweakSection>

        <TweakSection title="Layout variants">
          <TweakRadio label="Investor home"
            value={tweaks.homeLayout}
            onChange={v => setTweak("homeLayout", v)}
            options={[
              { value: "stack", label: "Stack" },
              { value: "grid", label: "Grid" },
            ]}
          />
          <TweakRadio label="Match hero"
            value={tweaks.matchHero}
            onChange={v => setTweak("matchHero", v)}
            options={[
              { value: "cards", label: "Cards" },
              { value: "list", label: "List" },
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

// hex → rgba helper (needed for tint setters)
function hexA(hex, a) {
  const m = hex.replace("#", "");
  const n = m.length === 3 ? m.split("").map(x => x+x).join("") : m;
  const r = parseInt(n.slice(0,2), 16), g = parseInt(n.slice(2,4), 16), b = parseInt(n.slice(4,6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// mount
if (!window.MM_CUSTOM_MOUNT) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Root />);
}