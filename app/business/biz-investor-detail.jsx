// biz-investor-detail.jsx — Business owner view of an investor's offer

function BizInvestorDetail({ investorId, onBack, onAccept, onCounter, onChat }) {
  const interest = window.MM_DATA.interested.find(i => i.investorId === investorId);
  const inv = window.MM_DATA.investors.find(v => v.id === investorId);
  if (!inv) return null;

  return (
    <div className="app">
      <div className="statusbar-spacer" />
      <AppHeader title="Offer review"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        trailing={<RoundBtn><Icon name="send" size={16} /></RoundBtn>}
      />
      <div className="scroll" style={{ paddingBottom: 100 }}>
        {/* identity */}
        <div className="pad" style={{ paddingTop: 6, textAlign: "center" }}>
          <div style={{ display: "inline-block", position: "relative" }}>
            <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={88} />
            <div style={{ position: "absolute", bottom: 0, right: 0 }}><VerifBadge size={22} /></div>
          </div>
          <div className="h1" style={{ fontSize: 28, marginTop: 14 }}>{inv.name}</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{inv.role}</div>
          <div className="row gap-6" style={{ justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
            <span className="chip forest"><Icon name="check" size={11} /> BVN verified</span>
            <span className="chip outline">{inv.portfolio} active deals</span>
          </div>
        </div>

        {/* offer */}
        <div className="pad" style={{ marginTop: 22 }}>
          <div className="card clay">
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Their offer to you</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 38, color: "#fff", lineHeight: 1.05 }} className="naira">
              {fmtNaira(interest?.offer.amount || 800000)}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
              {interest?.offer.terms}
            </div>
            <div className="hr" style={{ background: "rgba(255,255,255,0.18)", margin: "14px 0" }} />
            <div className="row between" style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>
              <span>Reporting · {interest?.offer.cadence}</span>
              <span>Type · {interest?.offer.type}</span>
            </div>
          </div>
        </div>

        {/* compatibility */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Compatibility check</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <CompatRow ok label="Amount overlap" detail={`Your ask ${fmtNairaRange(600000, 1200000)} fits their range`} />
            <CompatRow ok label="Return type" detail="Both: Revenue share" />
            <CompatRow ok label="Reporting cadence" detail="Both: Monthly" last />
          </div>
        </div>

        {/* about them */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>About {inv.name.split(" ")[0]}</div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>
              "{inv.bio}"
            </p>
            <div className="hr" style={{ margin: "14px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Mini label="Portfolio" value={`${inv.portfolio} deal${inv.portfolio === 1 ? "" : "s"}`} />
              <Mini label="Total deployed" value={fmtNaira(inv.deployed, { compact: true })} />
              <Mini label="Avg return" value={inv.avgReturn ? `${inv.avgReturn}%` : "—"} />
              <Mini label="Investing range" value={fmtNairaRange(inv.rangeMin, inv.rangeMax)} />
            </div>
          </div>
        </div>

        {/* their interests */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>What they back</div>
          <div className="row gap-6" style={{ flexWrap: "wrap" }}>
            {inv.interests.map(t => <span key={t} className="chip">{t}</span>)}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px 22px",
                    background: "linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)",
                    display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="row gap-8">
          <button className="btn btn-soft" style={{ flex: 1 }} onClick={onCounter}>Counter-offer</button>
          <button className="btn btn-forest" style={{ flex: 1.5 }} onClick={onAccept}>Accept and start deal</button>
        </div>
        <div className="row gap-8">
          <button onClick={onChat} className="btn btn-soft"
            style={{ flex: 1, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <Icon name="send" size={14} color="var(--ink-2)" /> Chat
          </button>
          {window.WhatsAppButton && (
            <WhatsAppButton phone={null} name="investor" context="business_to_investor" style={{ flex:1.5, borderRadius:12, padding:"11px" }} />
          )}
        </div>
      </div>
    </div>
  );
}

function CompatRow({ ok, label, detail, last }) {
  return (
    <div className="row gap-12" style={{ padding: "14px 16px", borderBottom: last ? 0 : "1px solid var(--line)" }}>
      <div style={{ width: 24, height: 24, borderRadius: 999, background: ok ? "var(--forest)" : "var(--clay)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={ok ? "check" : "close"} size={14} stroke={2.4} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, marginTop: 2, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}


Object.assign(window, { BizInvestorDetail, CompatRow, Mini });
