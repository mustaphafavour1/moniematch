// investor-3.jsx — Investor: Deal Summary, Funding flow, Portfolio, Updates feed, Profile.

// ─── DEAL SUMMARY (sign + escrow flow) ─────────────────
function InvDeal({ bizId, onBack, onComplete }) {
  const biz = window.MM_DATA.businesses.find(b => b.id === bizId);
  const [stage, setStage] = useState(0); // 0 review, 1 amount, 2 sign, 3 escrow loading, 4 done
  const [amount, setAmount] = useState(800000);
  const [sigDrawn, setSigDrawn] = useState(false);

  useEffect(() => {
    if (stage === 3) {
      const t = setTimeout(() => setStage(4), 2400);
      return () => clearTimeout(t);
    }
  }, [stage]);

  if (!biz) return null;

  return (
    <div className="app">
      <div className="statusbar-spacer" />
      <AppHeader
        title={stage === 4 ? "Deal funded" : "Deal Summary"}
        leading={stage > 0 && stage < 3 ? (
          <RoundBtn onClick={() => setStage(stage - 1)}><Icon name="back" size={18} /></RoundBtn>
        ) : stage === 0 ? (
          <RoundBtn onClick={onBack}><Icon name="close" size={18} /></RoundBtn>
        ) : null}
      />

      {stage === 0 && (
        <div className="scroll fadein" style={{ paddingBottom: 100 }}>
          <div className="pad">
            <div className="eyebrow">Plain-English alignment · not yet binding</div>
            <div className="h1" style={{ fontSize: 30, marginTop: 8 }}>
              You and {biz.name.split(" ")[0]}<br />
              <span style={{ fontStyle: "italic", color: "var(--clay)" }}>are aligned on the basics.</span>
            </div>
          </div>

          <div className="pad" style={{ marginTop: 16 }}>
            <div className="card">
              <div className="row between" style={{ marginBottom: 14 }}>
                <div className="row gap-10">
                  <Avatar name={biz.name} initials={biz.initials} color={biz.color} size={36} />
                  <div className="col">
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{biz.business}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{biz.name}</div>
                  </div>
                </div>
                <div className="chip forest"><Icon name="check" size={11} /> Verified</div>
              </div>
              <div className="hr" />
              <div style={{ marginTop: 12 }}>
                <TermLine label="Investment amount" value={fmtNaira(amount)} editable onClick={() => setStage(1)} />
                <TermLine label="Return structure" value={biz.returnHeadline} />
                <TermLine label="Reporting cadence" value={`${biz.cadence[0]} (with quarterly summary)`} />
                <TermLine label="Payout to" value="MonieMatch wallet" />
                <TermLine label="Default protection" value="48-hr hardship notice · 30% revenue drop trigger" multiline />
                <TermLine label="Hardship process" value="7-day meeting notice if revenue drops 30%+" multiline last />
              </div>
            </div>
          </div>

          <div className="pad" style={{ marginTop: 14 }}>
            <div className="card sand">
              <div className="row gap-10" style={{ alignItems: "flex-start" }}>
                <Icon name="shield" size={20} color="var(--forest)" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>What signing means</div>
                  <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>
                    You agree to fund this deal at the agreed terms. Money moves into <b>escrow</b> first; it's only released to {biz.name.split(" ")[0]} once both signatures are in. A lawyer should review the formal agreement before that.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 1 && (
        <div className="scroll fadein" style={{ padding: "0 22px" }}>
          <div className="eyebrow" style={{ marginTop: 8 }}>Investment amount</div>
          <div className="h1" style={{ fontSize: 28, marginTop: 6 }}>How much will you put in?</div>
          <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5, margin: "8px 0 24px" }}>
            {biz.name.split(" ")[0]} is raising {fmtNairaRange(biz.askMin, biz.askMax)}. Your range is ₦200k–₦1.5M.
          </p>

          <div style={{
            background: "var(--bone)", borderRadius: 24, padding: "30px 22px",
            border: "1px solid var(--line)",
          }}>
            <div style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: 48, color: "var(--ink)", lineHeight: 1, letterSpacing: "-0.01em" }}>
              <span className="naira">{fmtNaira(amount)}</span>
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--ink-3)" }}>
              ≈ {((amount / biz.target) * 100).toFixed(0)}% of {biz.business}'s raise
            </div>
            <input type="range" min={biz.askMin} max={biz.askMax} step={50000} value={amount}
                   onChange={e => setAmount(Number(e.target.value))}
                   style={{ width: "100%", marginTop: 22, accentColor: "var(--clay)" }} />
            <div className="row between" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
              <span>{fmtNaira(biz.askMin, { compact: true })}</span>
              <span>{fmtNaira(biz.askMax, { compact: true })}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
            {[400000, 800000, 1200000].map(p => (
              <button key={p} onClick={() => setAmount(p)}
                      className="btn btn-soft" style={{ padding: "10px", fontSize: 13 }}>
                {fmtNaira(p, { compact: true })}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Estimated return</div>
            <div className="card sand">
              <div className="row between">
                <div className="col">
                  <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05 }}>Per month (avg)</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>
                    <span className="naira">{fmtNaira(Math.round(amount * 0.083 / 12))}</span>
                  </div>
                </div>
                <div className="col" style={{ alignItems: "flex-end" }}>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05 }}>18-month total</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--forest)" }}>
                    <span className="naira">{fmtNaira(Math.round(amount * 1.124))}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 10 }}>
                Projection at 8% revenue share. Actual depends on monthly revenue.
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} onClick={() => setStage(2)}>
            Confirm amount
          </button>
        </div>
      )}

      {stage === 2 && (
        <div className="scroll fadein" style={{ padding: "0 22px" }}>
          <div className="eyebrow" style={{ marginTop: 8 }}>Final step before escrow</div>
          <div className="h1" style={{ fontSize: 28, marginTop: 6 }}>Sign the Deal Summary</div>
          <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5, margin: "8px 0 16px" }}>
            Sign with your finger. The owner countersigns from their app before any money moves.
          </p>

          <SignaturePad onChange={setSigDrawn} />

          <div className="row gap-8" style={{ marginTop: 14, fontSize: 12.5, color: "var(--ink-2)" }}>
            <Icon name="lock" size={14} />
            <span>Signed timestamp + IP recorded · audit trail kept by MonieMatch</span>
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 22, opacity: sigDrawn ? 1 : 0.45 }}
                  disabled={!sigDrawn}
                  onClick={() => setStage(3)}>
            Sign and fund {fmtNaira(amount, { compact: true })} into escrow
          </button>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11.5, color: "var(--ink-3)" }}>
            Funds held by Paystack Trust · released on counter-sign
          </div>
        </div>
      )}

      {stage === 3 && (
        <div className="fadein" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <EscrowAnim />
          <div className="h2" style={{ marginTop: 32, textAlign: "center" }}>Moving to escrow…</div>
          <p style={{ color: "var(--ink-2)", fontSize: 14, textAlign: "center", lineHeight: 1.5, marginTop: 8 }}>
            We're securing {fmtNaira(amount, { compact: true })} with our escrow partner.
          </p>
        </div>
      )}

      {stage === 4 && (
        <div className="fadein" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 22px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{
              width: 88, height: 88, borderRadius: 999,
              background: "var(--forest-tint)", color: "var(--forest)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "pulse-soft 1.6s ease-in-out infinite",
            }}>
              <Icon name="check" size={48} stroke={2.4} />
            </div>
            <div className="h1" style={{ fontSize: 30, marginTop: 24 }}>
              Funded.<br />
              <span style={{ fontStyle: "italic", color: "var(--clay)" }}>Welcome to the deal.</span>
            </div>
            <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5, marginTop: 10, maxWidth: 280 }}>
              {fmtNaira(amount, { compact: true })} is in escrow. {biz.name.split(" ")[0]} has been notified — you'll see the counter-sign in your inbox within 24 hours.
            </p>
            <div className="card sand" style={{ marginTop: 22, width: "100%", textAlign: "left" }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>What's next</div>
              <Step n="1" title="Owner counter-signs" body="Within 24 hours. Escrow releases automatically once they sign." />
              <div style={{ height: 12 }} />
              <Step n="2" title="First report on June 7" body={`${biz.name.split(" ")[0]} sends monthly updates with revenue + your payout.`} />
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={onComplete}>
            Back to portfolio
          </button>
        </div>
      )}
    </div>
  );
}

function TermLine({ label, value, editable, multiline, last, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", justifyContent: "space-between", alignItems: multiline ? "flex-start" : "center",
      padding: "12px 0",
      borderBottom: last ? 0 : "1px solid var(--line)",
      cursor: editable ? "pointer" : "default",
    }}>
      <div style={{ fontSize: 13, color: "var(--ink-2)", flexShrink: 0, marginRight: 16 }}>{label}</div>
      <div style={{ fontSize: 14, color: "var(--ink)", textAlign: "right", fontWeight: 500, lineHeight: 1.4 }}>
        {value}
        {editable && <Icon name="fwd" size={12} color="var(--ink-3)" />}
      </div>
    </div>
  );
}

function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.lineCap = "round"; ctx.lineWidth = 2.4; ctx.strokeStyle = "#1F1A14";
    const start = (e) => {
      drawingRef.current = true;
      const p = getPos(c, e);
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
    };
    const move = (e) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const p = getPos(c, e);
      ctx.lineTo(p.x, p.y); ctx.stroke();
      if (!drawn) { setDrawn(true); onChange?.(true); }
    };
    const end = () => { drawingRef.current = false; };
    c.addEventListener("pointerdown", start);
    c.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    return () => {
      c.removeEventListener("pointerdown", start);
      c.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
  }, [drawn, onChange]);

  function getPos(c, e) {
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  }
  function clear() {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setDrawn(false); onChange?.(false);
  }

  return (
    <div style={{
      background: "var(--bone)", borderRadius: 18, padding: 12,
      border: "1px dashed var(--line-strong)",
    }}>
      <canvas ref={canvasRef} width={640} height={220}
              style={{ width: "100%", height: 180, borderRadius: 10, background: "transparent",
                       touchAction: "none", display: "block" }} />
      <div className="row between" style={{ marginTop: 6 }}>
        <div style={{ fontSize: 11, color: "var(--ink-3)", fontStyle: "italic" }}>
          ── sign above ──
        </div>
        <button onClick={clear} className="btn btn-soft" style={{ padding: "6px 12px", fontSize: 12, height: "auto" }}>Clear</button>
      </div>
    </div>
  );
}

function EscrowAnim() {
  return (
    <div style={{ position: "relative", width: 220, height: 100 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", top: 40, left: 0,
          width: 16, height: 16, borderRadius: 999,
          background: "var(--clay)",
          animation: `escrow-flow 1.6s ${i * 0.5}s ease-in-out infinite`,
        }} />
      ))}
      <div style={{ position: "absolute", left: 0, top: 30, color: "var(--ink-3)", fontSize: 11, textAlign: "center", width: 50 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--linen)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)" }}>
          <Icon name="user" size={18} />
        </div>
        <div style={{ marginTop: 4 }}>You</div>
      </div>
      <div style={{ position: "absolute", right: 0, top: 30, color: "var(--ink-3)", fontSize: 11, textAlign: "center", width: 50 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--forest-tint)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--forest)" }}>
          <Icon name="lock" size={18} />
        </div>
        <div style={{ marginTop: 4 }}>Escrow</div>
      </div>
      <style>{`
        @keyframes escrow-flow {
          0% { left: 50px; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 154px; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── INVESTOR PORTFOLIO ─────────────────────
function InvPortfolio({ onPickPosition }) {
  const [deals, setDeals]     = React.useState(null); // null = loading
  const [error, setError]     = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await window.DB.getMyPortfolio();
        setDeals(data || []);
      } catch (e) {
        console.warn("[MM] portfolio load:", e);
        setDeals([]);
        setError(true);
      }
    })();
  }, []);

  // Fallback to mock while loading or if empty
  const useMock   = deals === null || (deals.length === 0 && !error);
  const mockItems = window.MM_DATA?.portfolio || [];
  const items     = useMock ? mockItems : deals;

  const total  = items.reduce((s, p) => s + (p.invested || p.amount || 0), 0);
  const repaid = items.reduce((s, p) => s + (p.paidBack || 0), 0);
  const active = items.filter(p => p.status === "active" || !p.status).length;

  if (deals === null) {
    const S = window.MM_SKEL;
    return S ? <S.SkeletonPortfolio light /> : null;
  }

  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="eyebrow">Live deals</div>
        <div className="h1" style={{ fontSize: 36, marginTop: 6 }}>Portfolio</div>
      </div>

      <div className="pad" style={{ marginTop: 18 }}>
        <div className="card ink">
          <div className="row between">
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,252,245,0.6)", textTransform: "uppercase", letterSpacing: 0.05 }}>Total deployed</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--cream)", marginTop: 4 }}>
                <AnimatedNaira value={total} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(255,252,245,0.6)", textTransform: "uppercase", letterSpacing: 0.05 }}>Paid back</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--sun)", marginTop: 4 }}>
                <span className="naira">{fmtNaira(repaid, { compact: true })}</span>
              </div>
            </div>
          </div>
          <div className="hr" style={{ background: "rgba(255,252,245,0.1)", margin: "16px 0" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <MiniStat dark label="Active" value={String(active)} />
            <MiniStat dark label="Avg return" value={total > 0 ? "—" : "0%"} />
            <MiniStat dark label="Watch" value="0" />
          </div>
        </div>
      </div>

      <div className="pad" style={{ marginTop: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Positions</div>
        {items.length === 0 ? (
          window.EmptyPortfolio
            ? <EmptyPortfolio onExplore={() => {}} />
            : <div style={{ padding:"32px 0", textAlign:"center", color:"var(--ink-3)", fontSize:14 }}>No active investments yet.</div>
        ) : (
          <div className="col gap-10">
            {items.map((p, i) => {
              const biz = p.biz || window.MM_DATA?.businesses?.find(b => b.id === p.businessId);
              return (
                <div key={p.dealId || p.id} onClick={() => onPickPosition(p)} className="fadein"
                     style={{ animationDelay: `${i * 80}ms` }}>
                  <PositionCard pos={p} biz={biz} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, dark, warn }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: dark ? "rgba(255,252,245,0.55)" : "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 2,
                    color: warn ? "var(--sun)" : dark ? "var(--cream)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}

function PositionCard({ pos, biz }) {
  const pct = (pos.monthsIn / pos.monthsTotal) * 100;
  return (
    <div className="card" style={{ padding: 14, cursor: "pointer" }}>
      <div className="row gap-12">
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `${biz.color}20`, color: biz.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: 20,
          flexShrink: 0,
        }}>{biz.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row between">
            <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{biz.business}</div>
            {pos.health === "watch" ? (
              <span className="chip sun"><Icon name="alert" size={11} /> Watch</span>
            ) : (
              <span className="chip forest">On track</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{pos.structure}</div>
        </div>
      </div>
      <div className="row between" style={{ marginTop: 12 }}>
        <div className="col">
          <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: 0.05, textTransform: "uppercase" }}>Invested</div>
          <div className="naira" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{fmtNaira(pos.invested, { compact: true })}</div>
        </div>
        <div className="col">
          <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: 0.05, textTransform: "uppercase" }}>Paid back</div>
          <div className="naira" style={{ fontSize: 14, fontWeight: 500, color: "var(--forest)" }}>{fmtNaira(pos.paidBack, { compact: true })}</div>
        </div>
        <div className="col" style={{ alignItems: "flex-end" }}>
          <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: 0.05, textTransform: "uppercase" }}>Last 3 months</div>
          <Spark values={pos.last3} color={pos.health === "watch" ? "var(--clay)" : "var(--forest)"} fill width={64} />
        </div>
      </div>
      <Progress value={pct} color={pos.health === "watch" ? "var(--sun)" : biz.color} height={4} />
      <div className="row between" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
        <span>Month {pos.monthsIn} of {pos.monthsTotal}</span>
        {pos.flag ? (
          <span style={{ color: "var(--clay)" }}>{pos.flag}</span>
        ) : pos.nextPayoutAmount ? (
          <span>Next: <b className="naira" style={{ color: "var(--ink)" }}>{fmtNaira(pos.nextPayoutAmount, { compact: true })}</b> · {new Date(pos.nextPayoutDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}</span>
        ) : null}
      </div>
    </div>
  );
}

// ─── INVESTOR UPDATES ─────────────────────
function InvUpdates() {
  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="eyebrow">Reports from your businesses</div>
        <div className="h1" style={{ fontSize: 36, marginTop: 6 }}>Updates</div>
      </div>

      <div className="pad col gap-12" style={{ marginTop: 18 }}>
        {window.MM_DATA.updates.map((u, i) => {
          const biz = window.MM_DATA.businesses.find(b => b.id === u.businessId);
          return (
            <div key={u.id} className="fadein" style={{ animationDelay: `${i * 80}ms` }}>
              <UpdateCard u={u} biz={biz} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UpdateCard({ u, biz }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", borderColor: u.flag ? "rgba(194,85,58,0.35)" : undefined }}>
      <div style={{ padding: "14px 16px 12px" }}>
        <div className="row gap-10">
          <Avatar name={biz.name} initials={biz.initials} color={biz.color} size={36} />
          <div style={{ flex: 1 }}>
            <div className="row between">
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{biz.business}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{relTime(u.whenISO)}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{biz.name} · {biz.city}</div>
          </div>
        </div>
      </div>
      {u.photoLab && <Photo label={u.photoLab} height={160} radius={0} color={`${biz.color}18`} />}
      <div style={{ padding: "12px 16px 16px" }}>
        {u.flag && (
          <div className="chip clay" style={{ marginBottom: 8 }}>
            <Icon name="alert" size={11} /> Hardship notice
          </div>
        )}
        <div style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--ink)", lineHeight: 1.25 }}>
          {u.headline}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--ink-2)" }}>
          {u.body}
        </p>
        {u.payout && (
          <div className="row between" style={{
            marginTop: 14, padding: "10px 14px",
            background: "var(--forest-tint)", borderRadius: 12,
          }}>
            <div className="row gap-8" style={{ color: "var(--forest)", fontSize: 13, fontWeight: 500 }}>
              <Icon name="trend-up" size={14} /> Payout to your wallet
            </div>
            <div className="naira" style={{ fontSize: 16, fontWeight: 500, color: "var(--forest)" }}>
              +{fmtNaira(u.payout)}
            </div>
          </div>
        )}
        {u.flag && (
          <div className="row gap-8" style={{ marginTop: 12 }}>
            <button className="btn btn-soft" style={{ flex: 1, padding: "10px", fontSize: 13 }}>Schedule call</button>
            <button className="btn btn-primary" style={{ flex: 1, padding: "10px", fontSize: 13 }}>Open chat</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── INVESTOR PROFILE ─────────────────────
function InvProfile({ user }) {
  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14, textAlign: "center" }}>
        <Avatar name={user.name} initials="FA" color="var(--forest)" size={88} />
        <div className="h1" style={{ fontSize: 26, marginTop: 14 }}>{user.name}</div>
        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>Investor · joined May 2026</div>
      </div>

      <div className="pad" style={{ marginTop: 22 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="money" label="Investment range" value="₦200k – ₦1.5M" />
          <DetailRow icon="trend-up" label="Preferred returns" value="Revenue share, Fixed" />
          <DetailRow icon="bell" label="Reporting cadence" value="Monthly + quarterly" />
          <DetailRow icon="shop" label="Industries of interest" value="Food, Fashion, Bakery, Barbing" last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Verification</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="check" label="BVN verified" value="✓" />
          <DetailRow icon="phone" label="Phone verified" value="✓" />
          <DetailRow icon="doc" label="ID upload" value="Pending" last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <div className="card sand">
          <div className="row gap-10" style={{ alignItems: "flex-start" }}>
            <Icon name="sparkle" size={18} color="var(--clay)" fill />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Get the Premium tier</div>
              <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, margin: "4px 0 10px" }}>
                Early deal access · sector analytics · priority matching. ₦7,500/month.
              </p>
              <button className="btn btn-clay" style={{ padding: "10px 16px", fontSize: 13 }}>Upgrade</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InvDeal, InvPortfolio, InvUpdates, InvProfile, UpdateCard, TermLine, SignaturePad, EscrowAnim });