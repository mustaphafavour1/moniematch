// report-history.jsx — Report history for business owners + investor view

// ─── REPORT CARD ──────────────────────────────────────────
function ReportCard({ report, onPress }) {
  const statusConfig = {
    submitted: { label: "Submitted", color: "var(--forest)", bg: "var(--forest-tint)" },
    late:      { label: "Late",      color: "var(--clay)",   bg: "var(--clay-tint)"   },
    pending:   { label: "Due soon",  color: "#8a5a00",       bg: "var(--sun-tint)"    },
  };
  const sc = statusConfig[report.status] || statusConfig.submitted;

  return (
    <div onClick={onPress} style={{
      background: "var(--bone)", borderRadius: 16,
      border: "1px solid var(--line)",
      padding: "14px 16px", cursor: onPress ? "pointer" : "default",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>
            {report.period}
          </p>
          <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0 }}>{report.date}</p>
        </div>
        <div style={{
          background: sc.bg, color: sc.color,
          fontSize: 11, fontWeight: 600, padding: "3px 10px",
          borderRadius: 999,
        }}>
          {sc.label}
        </div>
      </div>

      {/* Revenue */}
      {report.revenue != null && (
        <div style={{
          background: "var(--forest-tint)", borderRadius: 10,
          padding: "10px 12px", display: "flex", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 12, color: "var(--forest)", fontWeight: 500 }}>Revenue this period</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--forest)", fontFamily: "var(--font-display)" }}>
            {fmtNaira(report.revenue, { compact: true })}
          </span>
        </div>
      )}

      {/* Narrative snippet */}
      {report.narrative && (
        <p style={{ fontSize: 13, color: "var(--ink-2)", margin: 0, lineHeight: 1.45,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          "{report.narrative}"
        </p>
      )}

      {onPress && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 3 }}>
            View full report <Icon name="fwd" size={13} color="var(--ink-3)" />
          </span>
        </div>
      )}
    </div>
  );
}

// ─── BUSINESS OWNER — Report History ─────────────────────
function BizReportHistory({ onBack, onNewReport }) {
  const reports = [
    { id: 1, period: "April 2026",    date: "Submitted 8 May 2026",  status: "submitted", revenue: 480000, narrative: "Strong month — corporate cake orders from three new clients. Equipment upgrade completed." },
    { id: 2, period: "March 2026",    date: "Submitted 4 Apr 2026",  status: "submitted", revenue: 390000, narrative: "Slower than usual due to heat. Ramadan period reduced foot traffic significantly." },
    { id: 3, period: "February 2026", date: "Submitted 2 Mar 2026",  status: "submitted", revenue: 520000, narrative: "Valentine's orders were excellent. Highest single-month revenue since opening." },
    { id: 4, period: "January 2026",  date: "Submitted 3 Feb 2026",  status: "submitted", revenue: 310000, narrative: "Post-holiday slowdown as expected. Used the time to train two new staff." },
    { id: 5, period: "May 2026",      date: "Due 10 May 2026",       status: "pending",   revenue: null,   narrative: null },
  ].sort((a, b) => (a.status === "pending" ? -1 : 1));

  const submitted = reports.filter(r => r.status === "submitted");
  const totalRevenue = submitted.reduce((s, r) => s + (r.revenue || 0), 0);
  const avgRevenue = submitted.length ? Math.round(totalRevenue / submitted.length) : 0;

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Report history"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        trailing={
          <button onClick={onNewReport} style={{
            appearance: "none", border: 0, background: "none",
            color: "var(--forest)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            + New
          </button>
        }
        sticky
      />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>

          {/* Summary strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div style={{ background: "var(--forest)", borderRadius: 14, padding: "14px 14px", color: "#fff" }}>
              <p style={{ fontSize: 10.5, opacity: 0.7, margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Avg monthly
              </p>
              <p style={{ fontSize: 20, fontFamily: "var(--font-display)", margin: 0 }}>
                {fmtNaira(avgRevenue, { compact: true })}
              </p>
            </div>
            <div style={{ background: "var(--bone)", borderRadius: 14, padding: "14px 14px", border: "1px solid var(--line)" }}>
              <p style={{ fontSize: 10.5, color: "var(--ink-3)", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Reports filed
              </p>
              <p style={{ fontSize: 20, fontFamily: "var(--font-display)", color: "var(--ink)", margin: 0 }}>
                {submitted.length}
              </p>
            </div>
          </div>

          {/* Report list */}
          <div className="col gap-10">
            {reports.map(r => (
              <ReportCard key={r.id} report={r} onPress={r.status === "submitted" ? () => {} : null} />
            ))}
          </div>

          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}

// ─── INVESTOR — Reports received from a business ─────────
function InvReportsReceived({ bizId, onBack }) {
  const biz = window.MM_DATA.businesses.find(b => b.id === bizId) || { business: "Business", color: "var(--clay)", initials: "B" };

  const reports = [
    { id: 1, period: "April 2026",    date: "8 May 2026",   status: "submitted", revenue: 480000, narrative: "Strong month — corporate cake orders from three new clients. Equipment upgrade completed using the investment funds." },
    { id: 2, period: "March 2026",    date: "4 Apr 2026",   status: "submitted", revenue: 390000, narrative: "Slower than usual due to the heat. Ramadan period reduced foot traffic significantly but online orders picked up." },
    { id: 3, period: "February 2026", date: "2 Mar 2026",   status: "submitted", revenue: 520000, narrative: "Valentine's orders were excellent. Highest single-month revenue since we started working together." },
  ];

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Reports"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>

          {/* Business context */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
                        background: "var(--bone)", borderRadius: 14, padding: "12px 14px",
                        border: "1px solid var(--line)" }}>
            <Avatar name={biz.business} initials={biz.initials} color={biz.color} size={40} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: "0 0 2px" }}>{biz.business}</p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0 }}>
                {reports.length} report{reports.length !== 1 ? "s" : ""} received
              </p>
            </div>
          </div>

          {/* Trend */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-end" }}>
            {reports.slice().reverse().map((r, i) => (
              <div key={r.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%",
                  height: Math.round((r.revenue / 520000) * 60),
                  background: i === reports.length - 1 ? "var(--forest)" : "var(--forest-tint)",
                  borderRadius: "4px 4px 0 0",
                  transition: "height 600ms",
                }} />
                <span style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 500 }}>
                  {r.period.split(" ")[0].slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          {/* Reports */}
          <div className="col gap-10">
            {reports.map(r => <ReportCard key={r.id} report={r} onPress={() => {}} />)}
          </div>

          <div style={{ height: 32 }} />
        </div>
      </div>
    </div>
  );
}

// ─── COUNTER-OFFER / NEGOTIATION ──────────────────────────
function CounterOffer({ deal, role, onBack, onAccept, onDecline }) {
  // role: 'investor' | 'business'
  const isBiz = role === "business";
  const accent = isBiz ? "var(--forest)" : "var(--clay)";
  const accentTint = isBiz ? "var(--forest-tint)" : "var(--clay-tint)";

  const proposed = deal || {
    returnType: "Revenue share",
    returnDetail: "8% of monthly revenue · 18 months",
    amount: 800000,
    reporting: "Monthly",
  };

  const [counterAmount, setCounterAmount] = React.useState(proposed.amount);
  const [counterDetail, setCounterDetail] = React.useState(proposed.returnDetail);
  const [note, setNote] = React.useState("");

  return (
    <div className="app cream-bg" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader
        title="Counter-offer"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex: 1 }}>
        <div className="pad" style={{ paddingTop: 8 }}>

          <div style={{ marginBottom: 20, padding: "12px 14px", background: accentTint,
                        borderRadius: 12, borderLeft: `3px solid ${accent}` }}>
            <p style={{ fontSize: 13, color: isBiz ? "var(--brand-d, #085041)" : "#6b2a1a", margin: 0, lineHeight: 1.5 }}>
              {isBiz
                ? "The investor proposed terms below. You can accept, decline, or suggest different terms."
                : "The business owner has responded. Review and accept, or propose revised terms."}
            </p>
          </div>

          {/* Original terms */}
          <div className="eyebrow" style={{ marginBottom: 8 }}>Original terms proposed</div>
          <div className="card" style={{ padding: "14px 16px", marginBottom: 20, opacity: 0.7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Amount</span>
              <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)" }}>{fmtNaira(proposed.amount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Return structure</span>
              <span style={{ fontSize: 12.5, color: "var(--ink)" }}>{proposed.returnType}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Terms</span>
              <span style={{ fontSize: 12.5, color: "var(--ink)", textAlign: "right", maxWidth: "55%" }}>{proposed.returnDetail}</span>
            </div>
          </div>

          {/* Your counter */}
          <div className="eyebrow" style={{ marginBottom: 8 }}>Your counter-offer</div>
          <div className="col gap-12" style={{ marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "0 0 6px", fontWeight: 500 }}>Amount (₦)</p>
              <div style={{ background: "var(--bone)", border: "1px solid var(--line-strong)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 6 }}>
                <span style={{ fontSize: 14, color: "var(--ink-3)" }}>₦</span>
                <input type="number" value={counterAmount} onChange={e => setCounterAmount(Number(e.target.value))}
                       style={{ flex: 1, border: 0, background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 15, color: "var(--ink)" }} />
              </div>
              <p style={{ fontSize: 11, color: accent, margin: "4px 0 0", fontWeight: 600 }}>
                {fmtNaira(counterAmount, { compact: true })}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "0 0 6px", fontWeight: 500 }}>Return terms</p>
              <div style={{ background: "var(--bone)", border: "1px solid var(--line-strong)", borderRadius: 12, padding: "12px 14px" }}>
                <input value={counterDetail} onChange={e => setCounterDetail(e.target.value)}
                       style={{ width: "100%", border: 0, background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14, color: "var(--ink)" }} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "0 0 6px", fontWeight: 500 }}>Add a note <span style={{ fontWeight: 400, color: "var(--ink-4)" }}>(optional)</span></p>
              <div style={{ background: "var(--bone)", border: "1px solid var(--line-strong)", borderRadius: 12, padding: "12px 14px" }}>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                          placeholder="Explain your reasoning…"
                          rows={3}
                          style={{ width: "100%", border: 0, background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 14, color: "var(--ink)", resize: "none", lineHeight: 1.5 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "12px 22px 28px", borderTop: "1px solid var(--line)", background: "var(--cream)", display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onAccept} className="btn btn-block"
          style={{ background: accent, color: "#fff", border: "none", padding: 13, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Accept original terms
        </button>
        <button onClick={() => {}} className="btn btn-block"
          style={{ background: "var(--bone)", color: "var(--ink)", border: "1px solid var(--line-strong)", padding: 13, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Send counter-offer
        </button>
        <button onClick={onDecline} style={{
          appearance: "none", border: 0, background: "none",
          color: "var(--clay)", fontSize: 13.5, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit", padding: "8px 0", textAlign: "center",
        }}>
          Decline this offer
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { BizReportHistory, InvReportsReceived, CounterOffer, ReportCard });