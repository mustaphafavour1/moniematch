// settings.jsx — Shared settings / account screen

// ─── Settings row ─────────────────────────────────────────
function SettingsRow({ icon, label, value, onPress, danger, trailing }) {
  return (
    <div onClick={onPress} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "13px 0",
      borderBottom: "1px solid var(--line)",
      cursor: onPress ? "pointer" : "default",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: danger ? "var(--clay-tint)" : "rgba(31,26,20,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name={icon} size={17} color={danger ? "var(--clay)" : "var(--ink-2)"} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: danger ? "var(--clay)" : "var(--ink)", margin: 0 }}>{label}</p>
        {value && <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "2px 0 0" }}>{value}</p>}
      </div>
      {trailing || (onPress && !danger && <Icon name="fwd" size={16} color="var(--ink-4)" />)}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────
function SettingsSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{title}</div>
      <div className="card" style={{ padding: "0 14px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Investor Settings ────────────────────────────────────
function InvSettings({ user, onBack, onSignOut }) {
  const [notifications, setNotifications] = React.useState(true);

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Settings"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>

          {/* Profile card */}
          <div className="card" style={{ padding: "18px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar
              name={user?.name || "Investor"}
              initials={(user?.name || "In").slice(0, 2).toUpperCase()}
              color="var(--clay)"
              size={56}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>
                {user?.name || "Your name"}
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 6px" }}>
                {user?.phone || "+234 —"}
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <div className="chip outline" style={{ fontSize: 11 }}>Investor</div>
                <div className="chip forest" style={{ fontSize: 11 }}>Verified</div>
              </div>
            </div>
            <RoundBtn onClick={() => {}}><Icon name="user" size={16} /></RoundBtn>
          </div>

          {/* Investment preferences */}
          <SettingsSection title="Investment preferences">
            <SettingsRow
              icon="money"
              label="Investment range"
              value={user ? fmtNairaRange(user.rangeMin, user.rangeMax) : "Not set"}
              onPress={() => {}}
            />
            <SettingsRow
              icon="match"
              label="Preferred categories"
              value={(user?.interests || []).join(", ") || "All categories"}
              onPress={() => {}}
            />
            <SettingsRow
              icon="chart"
              label="Return preference"
              value={user?.returnGoal === "balanced" ? "Balanced (revenue share + fixed)" : user?.returnGoal || "Not set"}
              onPress={() => {}}
            />
          </SettingsSection>

          {/* App settings */}
          <SettingsSection title="App">
            <SettingsRow
              icon="bell"
              label="Push notifications"
              trailing={
                <button onClick={() => setNotifications(n => !n)} style={{
                  appearance: "none", border: "none", cursor: "pointer",
                  width: 44, height: 26, borderRadius: 999,
                  background: notifications ? "var(--clay)" : "var(--line-strong)",
                  transition: "background 220ms",
                  position: "relative", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 3, left: notifications ? 21 : 3,
                    width: 20, height: 20, borderRadius: 999,
                    background: "#fff", transition: "left 220ms",
                  }} />
                </button>
              }
            />
            <SettingsRow icon="shield" label="Privacy & security" onPress={() => {}} />
          </SettingsSection>

          {/* Support */}
          <SettingsSection title="Support">
            <SettingsRow icon="doc" label="How MonieMatch works" onPress={() => {}} />
            <SettingsRow icon="phone" label="Contact support" value="support@moniematch.com" onPress={() => {}} />
            <SettingsRow icon="lock" label="Terms & Privacy" onPress={() => {}} />
          </SettingsSection>

          {/* Sign out */}
          <SettingsSection title="Account">
            <SettingsRow
              icon="close"
              label="Sign out"
              danger
              onPress={onSignOut}
            />
          </SettingsSection>

          <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--ink-4)", marginTop: 8, paddingBottom: 32 }}>
            MonieMatch · Beta · v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Business Owner Settings ──────────────────────────────
function BizSettings({ user, onBack, onSignOut }) {
  const [notifications, setNotifications] = React.useState(true);

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Settings"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>

          {/* Profile card */}
          <div className="card" style={{ padding: "18px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar
              name={user?.bizName || "Business"}
              initials={(user?.bizName || "Bu").slice(0, 2).toUpperCase()}
              color="var(--forest)"
              size={56}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>
                {user?.bizName || "Your business"}
              </p>
              <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "0 0 6px" }}>
                Owner: {user?.name || "—"}
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <div className="chip outline" style={{ fontSize: 11 }}>{user?.category || "Business"}</div>
                <div className="chip forest" style={{ fontSize: 11 }}>Active raise</div>
              </div>
            </div>
            <RoundBtn onClick={() => {}}><Icon name="user" size={16} /></RoundBtn>
          </div>

          {/* Business profile */}
          <SettingsSection title="Business profile">
            <SettingsRow icon="shop" label="Edit business details" value="Name, category, description" onPress={() => {}} />
            <SettingsRow icon="money" label="Update investment ask" value="Amount range & use of funds" onPress={() => {}} />
            <SettingsRow icon="chart" label="Return preferences" value="Revenue share, fixed return" onPress={() => {}} />
          </SettingsSection>

          {/* App */}
          <SettingsSection title="App">
            <SettingsRow
              icon="bell"
              label="Push notifications"
              trailing={
                <button onClick={() => setNotifications(n => !n)} style={{
                  appearance: "none", border: "none", cursor: "pointer",
                  width: 44, height: 26, borderRadius: 999,
                  background: notifications ? "var(--forest)" : "var(--line-strong)",
                  transition: "background 220ms", position: "relative", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", top: 3, left: notifications ? 21 : 3,
                    width: 20, height: 20, borderRadius: 999,
                    background: "#fff", transition: "left 220ms",
                  }} />
                </button>
              }
            />
            <SettingsRow icon="shield" label="Privacy & security" onPress={() => {}} />
          </SettingsSection>

          {/* Support */}
          <SettingsSection title="Support">
            <SettingsRow icon="doc" label="How MonieMatch works" onPress={() => {}} />
            <SettingsRow icon="phone" label="Contact support" value="support@moniematch.com" onPress={() => {}} />
            <SettingsRow icon="lock" label="Terms & Privacy" onPress={() => {}} />
          </SettingsSection>

          {/* Sign out */}
          <SettingsSection title="Account">
            <SettingsRow icon="close" label="Sign out" danger onPress={onSignOut} />
          </SettingsSection>

          <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--ink-4)", marginTop: 8, paddingBottom: 32 }}>
            MonieMatch · Beta · v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}