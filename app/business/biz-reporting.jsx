// biz-reporting.jsx — Business owner monthly report submission

function BizReporting({ onBack, onSent }) {
  const draft = window.MM_DATA.draftReport;
  const [stage, setStage] = useState(0); // 0 prompt, 1 recording, 2 transcribing, 3 review, 4 sent
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (stage === 1) {
      const i = setInterval(() => setSeconds(s => s + 1), 1000);
      return () => clearInterval(i);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 2) {
      const t = setTimeout(() => setStage(3), 2200);
      return () => clearTimeout(t);
    }
  }, [stage]);

  return (
    <div className="app">
      <div className="statusbar-spacer" />
      <AppHeader title={`April 2026 report`} leading={<RoundBtn onClick={onBack}><Icon name="close" size={18} /></RoundBtn>} />

      {stage === 0 && (
        <div className="scroll fadein" style={{ padding: "0 22px 100px" }}>
          <div className="eyebrow" style={{ marginTop: 8 }}>3 investors waiting · 2 days due</div>
          <div className="h1" style={{ fontSize: 30, marginTop: 6 }}>
            Tell us how April went.<br />
            <span style={{ fontStyle: "italic", color: "var(--forest)" }}>We'll write the report.</span>
          </div>
          <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5, margin: "10px 0 22px" }}>
            Speak as long or as short as you like — revenue, expenses, anything new, anything to flag. About 60 seconds is plenty.
          </p>

          <div className="card sand">
            <div className="eyebrow" style={{ marginBottom: 8 }}>What investors will see</div>
            <div className="col gap-8" style={{ fontSize: 13 }}>
              <div className="row gap-8"><Icon name="trend-up" size={14} color="var(--forest)" /> Revenue, change vs March</div>
              <div className="row gap-8"><Icon name="chart" size={14} color="var(--forest)" /> Profit & expenses</div>
              <div className="row gap-8"><Icon name="sparkle" size={14} color="var(--forest)" /> Highlights & things to watch</div>
              <div className="row gap-8"><Icon name="money" size={14} color="var(--forest)" /> Their payout for the month</div>
            </div>
          </div>
        </div>
      )}

      {stage === 1 && (
        <div className="fadein" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
          <div style={{ position: "relative", width: 160, height: 160 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: "var(--clay)",
                          animation: "pulse-soft 1.8s ease-in-out infinite", opacity: 0.16 }} />
            <div style={{ position: "absolute", inset: 16, borderRadius: 999, background: "var(--clay)",
                          animation: "pulse-soft 1.8s ease-in-out infinite", animationDelay: "0.2s", opacity: 0.24 }} />
            <div style={{ position: "absolute", inset: 32, borderRadius: 999, background: "var(--clay)", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-md)" }}>
              <Icon name="mic" size={42} fill />
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, marginTop: 24, color: "var(--ink)" }}>
            {String(Math.floor(seconds/60)).padStart(2,"0")}:{String(seconds%60).padStart(2,"0")}
          </div>
          <div className="row gap-4" style={{ marginTop: 18, color: "var(--clay)" }}>
            {[0,1,2,3,4,5,6].map(i => (
              <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 18 }}>Listening… speak naturally.</p>
        </div>
      )}

      {stage === 2 && (
        <div className="fadein" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: "var(--linen)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--clay)",
                        animation: "pulse-soft 1.4s ease-in-out infinite" }}>
            <Icon name="sparkle" size={40} fill />
          </div>
          <div className="h2" style={{ marginTop: 22 }}>Writing your report…</div>
          <p style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 6 }}>Pulling revenue from your POS · structuring highlights</p>
        </div>
      )}

      {stage === 3 && (
        <div className="scroll fadein" style={{ paddingBottom: 100 }}>
          <div className="pad">
            <div className="row gap-8" style={{ marginBottom: 8 }}>
              <span className="chip clay"><Icon name="sparkle" size={11} fill /> AI-drafted</span>
              <span className="chip outline">Editable</span>
            </div>
            <div className="h2">{draft.month}</div>
            <p style={{ color: "var(--ink-2)", fontSize: 13, lineHeight: 1.5, margin: "8px 0 0", fontStyle: "italic" }}>
              "{draft.voiceTranscript.slice(0, 120)}…"
            </p>
          </div>

          <div className="pad" style={{ marginTop: 18 }}>
            <div className="card">
              <div className="row between">
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.04 }}>April revenue</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--ink)" }} className="naira">
                    {fmtNaira(draft.metrics.revenue)}
                  </div>
                </div>
                <span className="chip forest">+{draft.metrics.revenueDelta}% vs Mar</span>
              </div>
              <div className="hr" style={{ margin: "12px 0" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Mini label="Expenses" value={fmtNaira(draft.metrics.expenses, { compact: true })} />
                <Mini label="Profit" value={fmtNaira(draft.metrics.profit, { compact: true })} />
                <Mini label="Sold-out days" value={`${draft.metrics.soldOutDays}/26`} />
                <Mini label="Best day" value={`${draft.metrics.bestDay.date} · ${fmtNaira(draft.metrics.bestDay.amount, { compact: true })}`} />
              </div>
            </div>
          </div>

          <div className="pad" style={{ marginTop: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Highlights</div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {draft.highlights.map((h, i) => (
                <div key={i} className="row gap-10" style={{ padding: "12px 14px", borderBottom: i === draft.highlights.length - 1 ? 0 : "1px solid var(--line)" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 999, background: "var(--forest-tint)", color: "var(--forest)",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="check" size={12} stroke={2.6} />
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{h}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pad" style={{ marginTop: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Things to watch</div>
            <div className="card" style={{ padding: 0, overflow: "hidden", borderColor: "rgba(229,160,74,0.35)" }}>
              {draft.watch.map((h, i) => (
                <div key={i} className="row gap-10" style={{ padding: "12px 14px", borderBottom: i === draft.watch.length - 1 ? 0 : "1px solid var(--line)" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 999, background: "var(--sun-tint)", color: "#8a5d10",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="alert" size={12} stroke={2.4} />
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{h}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pad" style={{ marginTop: 14 }}>
            <div className="card forest">
              <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>Investor payout (auto-calc)</div>
              <div className="row between" style={{ alignItems: "flex-end" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#fff" }} className="naira">
                  {fmtNaira(draft.payoutDue)}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>8% of {fmtNaira(draft.metrics.revenue, { compact: true })}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 4 && (
        <div className="fadein" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 22px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ width: 88, height: 88, borderRadius: 999, background: "var(--forest-tint)", color: "var(--forest)",
                          display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="send" size={44} />
            </div>
            <div className="h1" style={{ fontSize: 30, marginTop: 24 }}>Sent.</div>
            <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 10, maxWidth: 280, lineHeight: 1.5 }}>
              Your April report is in 3 investor inboxes. Payout of {fmtNaira(draft.payoutDue)} will be released to Femi within 24 hours.
            </p>
          </div>
          <button className="btn btn-forest btn-block" onClick={onSent}>Done</button>
        </div>
      )}

      {stage < 4 && stage !== 1 && stage !== 2 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px 22px",
                      background: "linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)" }}>
          {stage === 0 && (
            <button className="btn btn-clay btn-block" onClick={() => { setSeconds(0); setStage(1); }}>
              <Icon name="mic" size={16} /> Start recording
            </button>
          )}
          {stage === 3 && (
            <div className="row gap-8">
              <button className="btn btn-soft" style={{ flex: 1 }}>Edit</button>
              <button className="btn btn-forest" style={{ flex: 1.6 }} onClick={() => setStage(4)}>Send to 3 investors</button>
            </div>
          )}
        </div>
      )}

      {stage === 1 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px 22px",
                      background: "linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)" }}>
          <button className="btn btn-primary btn-block" onClick={() => setStage(2)}>
            <Icon name="check" size={16} color="currentColor" /> Done · transcribe
          </button>
        </div>
      )}
    </div>
  );
}


Object.assign(window, { BizReporting });
