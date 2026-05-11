// investor-4.jsx — Match preferences, deal history, empty states

// ─── MATCH PREFERENCES ────────────────────────────────────
function InvMatchPrefs({ user, onBack, onSave }) {
  const allCats = ["Bakery", "Fashion", "Food", "Barbing", "Beauty", "Repair", "Retail", "Laundry", "Tailoring", "Photography"];
  const [cats, setCats] = React.useState(user?.interests || ["Bakery", "Fashion", "Food"]);
  const [minAmt, setMinAmt] = React.useState(user?.rangeMin || 100000);
  const [maxAmt, setMaxAmt] = React.useState(user?.rangeMax || 1500000);
  const [returnGoal, setReturnGoal] = React.useState(user?.returnGoal || "balanced");
  const [saving, setSaving] = React.useState(false);

  const toggleCat = (c) => setCats(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (window.MM_AUTH) {
        await window.MM_AUTH.saveInvestorProfile({
          interests: cats,
          investment_range: `${fmtNaira(minAmt, { compact: true })} – ${fmtNaira(maxAmt, { compact: true })}`,
          return_structures: [returnGoal],
        });
      }
      onSave && onSave({ interests: cats, rangeMin: minAmt, rangeMax: maxAmt, returnGoal });
    } catch (e) {
      console.warn("[MM] save prefs error:", e);
    }
    setSaving(false);
  };

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Match preferences"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "0 0 24px", lineHeight: 1.5 }}>
            Tell us more about what you're looking for and we'll improve your matches.
          </p>

          {/* Business categories */}
          <div className="eyebrow">Business types I'm interested in</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0 24px" }}>
            {allCats.map(c => {
              const on = cats.includes(c);
              return (
                <button key={c} onClick={() => toggleCat(c)} style={{
                  appearance: "none", border: "1.5px solid",
                  borderColor: on ? "var(--clay)" : "var(--line-strong)",
                  background: on ? "var(--clay-tint)" : "transparent",
                  color: on ? "var(--clay)" : "var(--ink-2)",
                  padding: "8px 14px", borderRadius: 999,
                  fontSize: 13, fontWeight: on ? 600 : 500,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 180ms",
                }}>
                  {c}
                </button>
              );
            })}
          </div>

          {/* Investment range */}
          <div className="eyebrow">Investment range</div>
          <div className="card" style={{ padding: "16px", margin: "12px 0 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Minimum", val: minAmt, set: setMinAmt },
                { label: "Maximum", val: maxAmt, set: setMaxAmt },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "0 0 6px", fontWeight: 500 }}>{label}</p>
                  <div style={{
                    background: "var(--bone)", border: "1px solid var(--line-strong)",
                    borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <span style={{ fontSize: 13, color: "var(--ink-3)" }}>₦</span>
                    <input
                      type="number"
                      value={val}
                      onChange={e => set(Number(e.target.value))}
                      style={{
                        flex: 1, border: 0, background: "transparent",
                        outline: "none", fontFamily: "inherit",
                        fontSize: 14, color: "var(--ink)",
                      }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: "var(--clay)", margin: "4px 0 0" }}>
                    {fmtNaira(val, { compact: true })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Return goal */}
          <div className="eyebrow">Preferred return structure</div>
          <div className="col gap-10" style={{ margin: "12px 0 32px" }}>
            {[
              { val: "revenue_share", label: "Revenue share", desc: "Percentage of monthly revenue until a total is reached" },
              { val: "fixed",         label: "Fixed return",  desc: "Set monthly repayment over an agreed timeline" },
              { val: "balanced",      label: "Either works",  desc: "Open to both — maximises your match chances" },
            ].map(opt => {
              const on = returnGoal === opt.val;
              return (
                <div key={opt.val} onClick={() => setReturnGoal(opt.val)} style={{
                  background: on ? "var(--clay-tint)" : "var(--bone)",
                  border: `1.5px solid ${on ? "var(--clay)" : "var(--line-strong)"}`,
                  borderRadius: 14, padding: "14px 16px",
                  cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12,
                  transition: "all 180ms",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 999, flexShrink: 0, marginTop: 2,
                    border: `2px solid ${on ? "var(--clay)" : "var(--line-strong)"}`,
                    background: on ? "var(--clay)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {on && <div style={{ width: 7, height: 7, borderRadius: 999, background: "#fff" }} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: "0 0 3px" }}>{opt.label}</p>
                    <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.4 }}>{opt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 22px 28px", borderTop: "1px solid var(--line)", background: "var(--cream)" }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-block">
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}

// ─── DEAL HISTORY (investor) ──────────────────────────────
function InvDealHistory({ onBack }) {
  const deals = [
    {
      id: 1, biz: "Layi Bakehouse", category: "Bakery",
      amount: 500000, status: "active", returnType: "Revenue share",
      started: "Mar 2026", progress: 68, initials: "LB", color: "#B45A3C",
    },
    {
      id: 2, biz: "Zara's Fashion", category: "Fashion",
      amount: 800000, status: "completed", returnType: "Fixed return",
      started: "Jan 2026", progress: 100, initials: "ZF", color: "#2D5D3F",
    },
    {
      id: 3, biz: "Mama's Kitchen", category: "Food",
      amount: 300000, status: "active", returnType: "Revenue share",
      started: "Feb 2026", progress: 40, initials: "MK", color: "#E5A04A",
    },
  ];

  const statusConfig = {
    active:    { label: "Active",    color: "var(--forest)", bg: "var(--forest-tint)" },
    completed: { label: "Completed", color: "var(--ink-3)",  bg: "rgba(31,26,20,0.06)" },
    defaulted: { label: "Defaulted", color: "var(--clay)",   bg: "var(--clay-tint)" },
  };

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Deal history"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />
      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>

          {/* Summary banner */}
          <div style={{
            background: "linear-gradient(135deg, var(--clay) 0%, #A04527 100%)",
            borderRadius: 18, padding: "18px 18px", marginBottom: 20, color: "#fff",
          }}>
            <p style={{ fontSize: 11.5, opacity: 0.75, margin: "0 0 4px", letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 600 }}>Total invested</p>
            <p style={{ fontSize: 28, fontFamily: "var(--font-display)", margin: "0 0 14px" }}>
              {fmtNaira(deals.reduce((s, d) => s + d.amount, 0))}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Deals", val: deals.length },
                { label: "Active", val: deals.filter(d => d.status === "active").length },
                { label: "Completed", val: deals.filter(d => d.status === "completed").length },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.14)", borderRadius: 10, padding: "9px 10px", textAlign: "center" }}>
                  <p style={{ fontSize: 18, fontFamily: "var(--font-display)", margin: "0 0 2px" }}>{val}</p>
                  <p style={{ fontSize: 10.5, opacity: 0.75, margin: 0, fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deal list */}
          <div className="eyebrow">All deals</div>
          <div className="col gap-10" style={{ marginTop: 12 }}>
            {deals.map(d => {
              const sc = statusConfig[d.status];
              return (
                <div key={d.id} className="card" style={{ padding: "14px 16px" }}>
                  <div className="row gap-12" style={{ marginBottom: 12 }}>
                    <Avatar name={d.biz} initials={d.initials} color={d.color} size={44} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>{d.biz}</p>
                      <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0 }}>{d.category} · {d.started}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-display)", color: "var(--ink)", margin: "0 0 4px" }}>
                        {fmtNaira(d.amount, { compact: true })}
                      </p>
                      <div style={{
                        background: sc.bg, color: sc.color,
                        fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
                        display: "inline-block",
                      }}>
                        {sc.label}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div className="row" style={{ justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{d.returnType}</span>
                      <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{d.progress}% returned</span>
                    </div>
                    <Progress value={d.progress} color={d.status === "completed" ? "var(--forest)" : "var(--clay)"} height={5} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE: No matches yet ─────────────────────────
function EmptyMatches({ onUpdatePrefs }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "60px 24px", gap: 16, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: "var(--clay-tint)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="match" size={30} color="var(--clay)" />
      </div>
      <div>
        <p style={{ fontSize: 18, fontFamily: "var(--font-display)", color: "var(--ink)", margin: "0 0 8px" }}>
          No matches yet
        </p>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>
          We're finding businesses that match<br />your investment preferences.
        </p>
      </div>
      <button onClick={onUpdatePrefs} className="btn btn-primary" style={{ marginTop: 8, padding: "12px 24px" }}>
        Update preferences <Icon name="fwd" size={15} color="currentColor" />
      </button>
    </div>
  );
}

// ─── EMPTY STATE: No portfolio ────────────────────────────
function EmptyPortfolio({ onExplore }) {
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
        <Icon name="chart" size={30} color="var(--sun)" />
      </div>
      <div>
        <p style={{ fontSize: 18, fontFamily: "var(--font-display)", color: "var(--ink)", margin: "0 0 8px" }}>
          No active investments
        </p>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>
          Back your first business to start<br />building your portfolio.
        </p>
      </div>
      <button onClick={onExplore} className="btn btn-primary" style={{ marginTop: 8, padding: "12px 24px" }}>
        Explore matches <Icon name="fwd" size={15} color="currentColor" />
      </button>
    </div>
  );
}