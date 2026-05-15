// inv-portfolio.jsx — Investor portfolio screen and position cards

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


Object.assign(window, { InvPortfolio, MiniStat, PositionCard, InvUpdates, UpdateCard });
