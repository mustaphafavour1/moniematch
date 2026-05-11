// business-3.jsx — Business profile edit, funding progress, deal history, empty states

// ─── BUSINESS PROFILE EDIT ────────────────────────────────
function BizProfileEdit({ user, onBack, onSave }) {
  const [bizName, setBizName]     = React.useState(user?.bizName     || "");
  const [category, setCategory]   = React.useState(user?.category    || "");
  const [desc, setDesc]           = React.useState(user?.description || "");
  const [revenue, setRevenue]     = React.useState(user?.revenue     || "");
  const [ask, setAsk]             = React.useState(user?.investmentAsk || "");
  const [useOfFunds, setUseOfFunds] = React.useState(user?.useOfFunds || "");
  const [saving, setSaving]       = React.useState(false);

  const cats = ["Bakery", "Fashion", "Food", "Barbing", "Beauty", "Repair", "Retail", "Laundry", "Tailoring", "Photography", "Other"];
  const revenues = ["Under ₦50,000", "₦50k – ₦150k", "₦150k – ₦500k", "₦500k – ₦1M", "Over ₦1M"];

  const handleSave = async () => {
    setSaving(true);
    try {
      if (window.MM_AUTH) {
        await window.MM_AUTH.saveBusinessProfile({
          name: bizName, category, description: desc,
          revenue_range: revenue, use_of_funds: useOfFunds,
          investment_needed: ask,
        });
      }
      onSave && onSave({ bizName, category, description: desc, revenue, useOfFunds, investmentAsk: ask });
    } catch (e) {
      console.warn("[MM] save biz profile error:", e);
    }
    setSaving(false);
  };

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Edit profile"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad col gap-20" style={{ paddingTop: 8 }}>

          {/* Business name */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Business name</p>
            <div style={{ background: "var(--bone)", border: "1px solid var(--line-strong)", borderRadius: 14, padding: "12px 16px" }}>
              <input
                value={bizName}
                onChange={e => setBizName(e.target.value)}
                placeholder="e.g. Layi Bakehouse"
                style={{ width: "100%", border: 0, background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 15, color: "var(--ink)" }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Category</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {cats.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  appearance: "none", border: "1.5px solid",
                  borderColor: category === c ? "var(--forest)" : "var(--line-strong)",
                  background: category === c ? "var(--forest-tint)" : "transparent",
                  color: category === c ? "var(--forest)" : "var(--ink-2)",
                  padding: "7px 12px", borderRadius: 999,
                  fontSize: 12.5, fontWeight: category === c ? 600 : 500,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 160ms",
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>One-sentence description</p>
            <div style={{ background: "var(--bone)", border: "1px solid var(--line-strong)", borderRadius: 14, padding: "12px 16px" }}>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="e.g. We bake artisan bread and pastries for Lagos homes and offices"
                rows={3}
                style={{ width: "100%", border: 0, background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14, color: "var(--ink)", resize: "none", lineHeight: 1.5 }}
              />
            </div>
          </div>

          {/* Monthly revenue */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Monthly revenue range</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {revenues.map(r => (
                <button key={r} onClick={() => setRevenue(r)} style={{
                  appearance: "none", border: "1.5px solid",
                  borderColor: revenue === r ? "var(--forest)" : "var(--line-strong)",
                  background: revenue === r ? "var(--forest-tint)" : "transparent",
                  color: revenue === r ? "var(--forest)" : "var(--ink-2)",
                  padding: "7px 12px", borderRadius: 999,
                  fontSize: 12.5, fontWeight: revenue === r ? 600 : 500,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 160ms",
                }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Investment ask */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Investment ask</p>
            <div style={{ background: "var(--bone)", border: "1px solid var(--line-strong)", borderRadius: 14, padding: "12px 16px" }}>
              <input
                value={ask}
                onChange={e => setAsk(e.target.value)}
                placeholder="e.g. ₦200k minimum · ₦800k ideal"
                style={{ width: "100%", border: 0, background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14, color: "var(--ink)" }}
              />
            </div>
          </div>

          {/* Use of funds */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 8 }}>What the investment will be used for</p>
            <div style={{ background: "var(--bone)", border: "1px solid var(--line-strong)", borderRadius: 14, padding: "12px 16px" }}>
              <textarea
                value={useOfFunds}
                onChange={e => setUseOfFunds(e.target.value)}
                placeholder="e.g. New industrial oven (₦300k) and 3 months of raw materials (₦200k)"
                rows={3}
                style={{ width: "100%", border: 0, background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14, color: "var(--ink)", resize: "none", lineHeight: 1.5 }}
              />
            </div>
          </div>

          <div style={{ height: 20 }} />
        </div>
      </div>

      <div style={{ padding: "12px 22px 28px", borderTop: "1px solid var(--line)", background: "var(--cream)" }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-forest btn-block">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ─── FUNDING PROGRESS ─────────────────────────────────────
function BizFundingProgress({ user, onBack }) {
  const target   = 1200000;
  const raised   = 720000;
  const pct      = Math.round((raised / target) * 100);
  const daysLeft = 10;

  const investors = [
    { name: "Femi Adesanya", initials: "FA", color: "#B45A3C", amount: 500000, status: "Active", returnType: "8% rev · 18mo" },
    { name: "Ngozi Okeke",   initials: "NO", color: "#2D5D3F", amount: 220000, status: "Pending", returnType: "9% rev · 24mo" },
  ];

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Funding progress"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>

          {/* Main progress card */}
          <div style={{
            background: "linear-gradient(135deg, var(--forest) 0%, #1E4028 100%)",
            borderRadius: 20, padding: "20px 18px", color: "#fff", marginBottom: 20,
          }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 11.5, opacity: 0.75, margin: 0, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>
                Active raise
              </p>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "4px 10px" }}>
                <span style={{ fontSize: 11.5, fontWeight: 600 }}>{daysLeft} days left</span>
              </div>
            </div>
            <p style={{ fontSize: 11.5, opacity: 0.65, margin: "0 0 4px", fontWeight: 500 }}>Raised</p>
            <p style={{ fontSize: 32, fontFamily: "var(--font-display)", margin: "0 0 4px" }}>
              {fmtNaira(raised)}
            </p>
            <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 18px" }}>
              of {fmtNaira(target, { compact: true })} target
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "var(--sun)", borderRadius: 999, transition: "width 900ms cubic-bezier(0.2,0.8,0.2,1)" }} />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>{pct}%</span>
            </div>
            <p style={{ fontSize: 12, opacity: 0.65, margin: "10px 0 0" }}>
              ✦ {fmtNaira(target - raised, { compact: true })} more closes the round.
            </p>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Investors", val: investors.length },
              { label: "Avg. investment", val: fmtNaira(raised / investors.length, { compact: true }) },
              { label: "Round closes", val: "May 20, 2026" },
              { label: "Structure", val: "Revenue share" },
            ].map(({ label, val }) => (
              <div key={label} className="card" style={{ padding: "12px 14px" }}>
                <p style={{ fontSize: 11, color: "var(--ink-3)", margin: "0 0 4px", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: 0 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Investor list */}
          <div className="eyebrow">Your investors</div>
          <div className="col gap-10" style={{ marginTop: 12, marginBottom: 32 }}>
            {investors.map((inv, i) => (
              <div key={i} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={42} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>{inv.name}</p>
                  <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0 }}>{inv.returnType}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--ink)", margin: "0 0 4px" }}>
                    {fmtNaira(inv.amount, { compact: true })}
                  </p>
                  <div style={{
                    background: inv.status === "Active" ? "var(--forest-tint)" : "var(--sun-tint)",
                    color: inv.status === "Active" ? "var(--forest)" : "#8a5a00",
                    fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
                    display: "inline-block",
                  }}>
                    {inv.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BUSINESS DEAL HISTORY ────────────────────────────────
function BizDealHistory({ onBack }) {
  const deals = [
    { id: 1, investor: "Femi Adesanya", initials: "FA", color: "#B45A3C", amount: 500000, status: "active",    returnType: "8% rev · 18 months", started: "Mar 2026", returned: 68000 },
    { id: 2, investor: "Ngozi Okeke",   initials: "NO", color: "#2D5D3F", amount: 220000, status: "active",    returnType: "9% rev · 24 months", started: "Apr 2026", returned: 12000 },
    { id: 3, investor: "Bode Williams", initials: "BW", color: "#6B3F4E", amount: 400000, status: "completed", returnType: "Fixed · 12 months",  started: "Jun 2025", returned: 480000 },
  ];

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Deal history"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>
          <div className="col gap-10">
            {deals.map(d => (
              <div key={d.id} className="card" style={{ padding: "14px 16px" }}>
                <div className="row gap-12" style={{ marginBottom: 10 }}>
                  <Avatar name={d.investor} initials={d.initials} color={d.color} size={40} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>{d.investor}</p>
                    <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: 0 }}>{d.returnType} · Since {d.started}</p>
                  </div>
                  <div style={{
                    background: d.status === "active" ? "var(--forest-tint)" : "rgba(31,26,20,0.06)",
                    color: d.status === "active" ? "var(--forest)" : "var(--ink-3)",
                    fontSize: 10.5, fontWeight: 600, padding: "3px 8px",
                    borderRadius: 999, alignSelf: "flex-start",
                  }}>
                    {d.status === "active" ? "Active" : "Completed"}
                  </div>
                </div>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ color: "var(--ink-3)" }}>Invested: <strong style={{ color: "var(--ink)" }}>{fmtNaira(d.amount, { compact: true })}</strong></span>
                  <span style={{ color: "var(--ink-3)" }}>Returned: <strong style={{ color: d.status === "completed" ? "var(--forest)" : "var(--ink)" }}>{fmtNaira(d.returned, { compact: true })}</strong></span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE: No investor offers ─────────────────────
function EmptyInvestors({ onShare }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "60px 24px", gap: 16, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: "var(--forest-tint)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="wallet" size={30} color="var(--forest)" />
      </div>
      <div>
        <p style={{ fontSize: 18, fontFamily: "var(--font-display)", color: "var(--ink)", margin: "0 0 8px" }}>
          No offers yet
        </p>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>
          We're matching you with investors.<br />Complete your profile to improve visibility.
        </p>
      </div>
      <button onClick={onShare} className="btn btn-forest" style={{ marginTop: 8, padding: "12px 24px" }}>
        Complete profile <Icon name="fwd" size={15} color="currentColor" />
      </button>
    </div>
  );
}

// ─── EMPTY STATE: No reports submitted ───────────────────
function EmptyReports({ onStart }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "60px 24px", gap: 16, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: "var(--sun-tint)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="doc" size={30} color="var(--sun)" />
      </div>
      <div>
        <p style={{ fontSize: 18, fontFamily: "var(--font-display)", color: "var(--ink)", margin: "0 0 8px" }}>
          No reports yet
        </p>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>
          Submit your first report to keep<br />your investors informed and your deal healthy.
        </p>
      </div>
      <button onClick={onStart} className="btn btn-forest" style={{ marginTop: 8, padding: "12px 24px" }}>
        Submit a report <Icon name="mic" size={15} color="currentColor" />
      </button>
    </div>
  );
}