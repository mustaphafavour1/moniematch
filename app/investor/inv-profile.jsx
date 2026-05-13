// inv-profile.jsx — Investor profile screen

function InvProfile({ user, onEditPrefs, onSettings, onSignOut }) {
  const name      = user?.name     || "Investor";
  const initials  = user?.initials || name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const color     = user?.color    || "var(--forest)";
  const range     = user?.investmentRange || "—";
  const returns   = (user?.returnStructures || []).join(", ") || "—";
  const cadence   = (user?.reportingCadence || []).join(", ") || "—";
  const interests = (user?.interests || []).join(", ") || "—";
  const uname     = user?.username  ? `@${user.username}` : "";

  return (
    <div className="scroll" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div className="pad" style={{ paddingTop:14, textAlign:"center" }}>
        <Avatar name={name} initials={initials} color={color} size={88} />
        <div className="h1" style={{ fontSize:26, marginTop:14 }}>{name}</div>
        {uname && <div style={{ fontSize:13, color:"var(--clay)", marginTop:2, fontWeight:600 }}>{uname}</div>}
        <div style={{ fontSize:13, color:"var(--ink-3)", marginTop:2 }}>Investor · {user?.city || "Nigeria"}</div>
      </div>

      {/* Investment preferences — with edit button */}
      <div className="pad" style={{ marginTop:22 }}>
        <div className="row between" style={{ marginBottom:10 }}>
          <div className="eyebrow">Investment preferences</div>
          <button onClick={onEditPrefs}
            style={{ appearance:"none", border:"1.5px solid var(--line-strong)", background:"none", borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:600, color:"var(--clay)", cursor:"pointer", fontFamily:"inherit" }}>
            Edit
          </button>
        </div>
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <DetailRow icon="money"    label="Investment range"   value={range} />
          <DetailRow icon="trend-up" label="Preferred returns"  value={returns} />
          <DetailRow icon="bell"     label="Reporting cadence"  value={cadence} />
          <DetailRow icon="shop"     label="Industries"         value={interests} last />
        </div>
      </div>

      {/* Actions */}
      <div className="pad" style={{ marginTop:14 }}>
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <div onClick={onSettings}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor:"pointer", borderBottom:"1px solid var(--line)" }}>
            <Icon name="settings" size={18} color="var(--ink-3)" />
            <span style={{ fontSize:14, color:"var(--ink)" }}>Settings</span>
            <Icon name="fwd" size={14} color="var(--ink-4)" style={{ marginLeft:"auto" }} />
          </div>
          <div onClick={onSignOut}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", cursor:"pointer" }}>
            <Icon name="logout" size={18} color="var(--clay)" />
            <span style={{ fontSize:14, color:"var(--clay)", fontWeight:500 }}>Sign out</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InvProfile });