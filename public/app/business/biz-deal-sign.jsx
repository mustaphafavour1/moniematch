// biz-deal-sign.jsx — Business owner deal counter-signing and confirmation

function BizDealSign({ investorId, onBack, onComplete }) {
  const inv = window.MM_DATA.investors.find(v => v.id === investorId);
  const [stage, setStage] = useState(0); // 0 review, 1 sign, 2 escrow, 3 received
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (stage === 2) {
      const t = setTimeout(() => setStage(3), 2400);
      return () => clearTimeout(t);
    }
  }, [stage]);

  return (
    <div className="app">
      <div className="statusbar-spacer" />
      <AppHeader title={stage === 3 ? "Funded" : "Counter-sign"}
        leading={stage === 0 ? <RoundBtn onClick={onBack}><Icon name="close" size={18} /></RoundBtn> : null} />

      {stage === 0 && (
        <div className="scroll fadein" style={{ paddingBottom: 100 }}>
          <div className="pad">
            <div className="eyebrow">Both must sign before money releases</div>
            <div className="h1" style={{ fontSize: 28, marginTop: 8 }}>
              {inv.name} signed.<br />
              <span style={{ fontStyle: "italic", color: "var(--forest)" }}>Your turn.</span>
            </div>
          </div>

          <div className="pad" style={{ marginTop: 14 }}>
            <div className="card">
              <div className="row gap-12" style={{ marginBottom: 14 }}>
                <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={36} />
                <div className="col">
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{inv.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Counter-party</div>
                </div>
                <div style={{ marginLeft: "auto" }}><span className="chip forest"><Icon name="check" size={11} /> Signed</span></div>
              </div>
              <div className="hr" />
              <div style={{ marginTop: 12 }}>
                <TermLine label="Investment amount" value="₦800,000" />
                <TermLine label="Return structure" value="8% revenue share · 18 months" />
                <TermLine label="Reporting cadence" value="Monthly" />
                <TermLine label="Hardship trigger" value="30% revenue drop · 7-day meeting" multiline />
                <TermLine label="Escrow partner" value="Paystack Trust" last />
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 1 && (
        <div className="scroll fadein" style={{ padding: "0 22px" }}>
          <div className="eyebrow" style={{ marginTop: 8 }}>Your signature</div>
          <div className="h1" style={{ fontSize: 26, marginTop: 6 }}>Sign to release escrow</div>
          <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5, margin: "8px 0 16px" }}>
            ₦800,000 will land in your business wallet within minutes of your sign.
          </p>
          <SignaturePad onChange={setDrawn} />
        </div>
      )}

      {stage === 2 && (
        <div className="fadein" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <EscrowAnim />
          <div className="h2" style={{ marginTop: 32 }}>Releasing funds…</div>
        </div>
      )}

      {stage === 3 && (
        <div className="fadein" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 22px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ width: 88, height: 88, borderRadius: 999, background: "var(--forest-tint)", color: "var(--forest)",
                          display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse-soft 1.6s ease-in-out infinite" }}>
              <Icon name="check" size={48} stroke={2.4} />
            </div>
            <div className="h1" style={{ fontSize: 30, marginTop: 24 }}>
              <AnimatedNaira value={800000} /><br />
              <span style={{ fontStyle: "italic", color: "var(--forest)" }}>landed.</span>
            </div>
            <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 10, maxWidth: 280, lineHeight: 1.5 }}>
              In your MonieMatch business wallet. First report due May 31.
            </p>
            <div className="card sand" style={{ marginTop: 22, width: "100%", textAlign: "left" }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>What's next</div>
              <Step n="1" title="Buy the oven" body="Move funds to your supplier from the wallet." />
              <div style={{ height: 12 }} />
              <Step n="2" title="Send your first report" body="Voice-note works. We turn it into a structured update." />
            </div>
          </div>
          <button className="btn btn-forest btn-block" onClick={onComplete}>Back to home</button>
        </div>
      )}

      {stage < 3 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px 22px",
                      background: "linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)" }}>
          {stage === 0 && (
            <button className="btn btn-forest btn-block" onClick={() => setStage(1)}>
              Continue to signature
            </button>
          )}
          {stage === 1 && (
            <button className="btn btn-forest btn-block" disabled={!drawn} style={{ opacity: drawn ? 1 : 0.45 }}
                    onClick={() => setStage(2)}>
              Counter-sign and release ₦800,000
            </button>
          )}
        </div>
      )}
    </div>
  );
}


Object.assign(window, { BizDealSign });
