// investor-2.jsx — Investor: Matches list, Business detail, Deal Summary, Portfolio, Updates, Profile.

// ─── INVESTOR — ALL MATCHES (filterable list) ──────────────
function InvMatches({ onPickBusiness, matches: propMatches }) {
  const [filter, setFilter] = useState("all");

  // null = loading, undefined = demo mode, [] = real but empty, [...] = real data
  const isDemoMode = propMatches === undefined;
  const loading    = propMatches === null;
  const allMatches = isDemoMode
    ? (window.MM_DATA?.businesses || [])
    : (propMatches || []);

  // Derive filter options from real data
  const categories = ["all", ...new Set(allMatches.map(b => b.category).filter(Boolean))];
  const filters = categories.slice(0, 6).map(id => ({ id, label: id === "all" ? "All" : id }));

  const list = filter === "all"
    ? allMatches
    : allMatches.filter(b => b.category === filter);

  if (loading) {
    const S = window.MM_SKEL;
    return S ? <S.SkeletonMatches light /> : null;
  }

  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="eyebrow">Matched to your preferences</div>
        <div className="h1" style={{ fontSize: 36, marginTop: 8 }}>Matches</div>
        <p style={{ color: "var(--ink-2)", fontSize: 14, lineHeight: 1.5, margin: "8px 0 0" }}>
          {allMatches.length} {allMatches.length === 1 ? "business matches" : "businesses match"} your range, return type and cadence.
        </p>
      </div>

      {/* search */}
      <div className="pad" style={{ marginTop: 18 }}>
        <div className="row gap-10" style={{
          background: "var(--bone)", border: "1px solid var(--line-strong)",
          borderRadius: 14, padding: "10px 14px",
        }}>
          <Icon name="search" size={18} color="var(--ink-3)" />
          <input placeholder="Search by business or owner"
                 style={{ flex: 1, border: 0, background: "transparent", outline: "none",
                          fontFamily: "inherit", fontSize: 14, color: "var(--ink)" }} />
          <Icon name="filter" size={18} color="var(--ink-3)" />
        </div>
      </div>

      {/* filter chips */}
      <div style={{ marginTop: 14, paddingLeft: 22, overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 6, paddingRight: 22 }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
                    style={{
                      appearance: "none", border: "1px solid",
                      borderColor: filter === f.id ? "var(--ink)" : "var(--line-strong)",
                      background: filter === f.id ? "var(--ink)" : "transparent",
                      color: filter === f.id ? "var(--cream)" : "var(--ink-2)",
                      padding: "8px 14px", borderRadius: 999,
                      fontSize: 12.5, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
                      transition: "all 200ms",
                    }}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="pad col gap-10" style={{ marginTop: 18 }}>
        {list.length > 0
          ? list.map((b, i) => (
              <div key={b.id} className="fadein" style={{ animationDelay: `${i * 50}ms` }}>
                <BizListCard biz={b} onClick={() => onPickBusiness(b.id)} />
              </div>
            ))
          : <EmptyMatches onUpdatePrefs={() => {}} />
        }
      </div>
    </div>
  );
}

function BizListCard({ biz, onClick }) {
  const pct = Math.round((biz.raised / biz.target) * 100);
  return (
    <div onClick={onClick} className="card" style={{ padding: 14, cursor: "pointer" }}>
      <div className="row gap-12">
        <div style={{
          width: 64, height: 64, borderRadius: 14,
          background: `${biz.color}20`, color: biz.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: 24,
          position: "relative", overflow: "hidden", flexShrink: 0,
        }}>
          <span style={{ position: "relative", zIndex: 1 }}>{biz.initials}</span>
          <span style={{ position: "absolute", inset: 0,
            backgroundImage: "repeating-linear-gradient(135deg, transparent 0 7px, rgba(31,26,20,0.04) 7px 8px)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row between">
            <div style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>{biz.business}</div>
            <MatchDial score={biz.matchScore} size={36} label={false} />
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
            {biz.category} · {biz.city}
          </div>
          <div className="row gap-6" style={{ marginTop: 6, flexWrap: "wrap" }}>
            <span className="chip" style={{ background: `${biz.color}15`, color: biz.color }}>{biz.returnHeadline.split(" · ")[0]}</span>
            <span className="chip outline">{biz.returnHeadline.split(" · ")[1]}</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Progress value={pct} color={biz.color} />
        <div className="row between" style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-3)" }}>
          <span><b style={{ color: "var(--ink)" }} className="naira">{fmtNaira(biz.raised, { compact: true })}</b> raised</span>
          <span>of <span className="naira">{fmtNaira(biz.target, { compact: true })}</span> · {pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── BUSINESS DETAIL (the pitch page) ────────────────────
function InvBusinessDetail({ bizId, onBack, onProceed, onInvest, onReports }) {
  const [biz, setBiz] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!bizId) { setLoading(false); return; }

    // If it's a short mock ID (like "aisha"), use mock data
    const isMockId = bizId.length < 20;
    if (isMockId) {
      const mock = window.MM_DATA?.businesses?.find(b => b.id === bizId);
      setBiz(mock || null);
      setLoading(false);
      return;
    }

    // Real UUID — fetch from DB
    (async () => {
      try {
        const data = await window.DB.getBusinessById(bizId);
        setBiz(data);
      } catch (e) {
        console.warn("[MM] biz detail load:", e);
        setBiz(null);
      }
      setLoading(false);
    })();
  }, [bizId]);

  if (loading) {
    const S = window.MM_SKEL;
    return S ? <S.SkeletonDetail /> : null;
  }
  if (!biz) return (
    <div className="app cream-bg" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", padding:32 }}>
        <p style={{ fontFamily:"var(--font-display)", fontSize:20, color:"var(--ink)", marginBottom:8 }}>Business not found</p>
        <button onClick={onBack} style={{ appearance:"none", border:"1.5px solid var(--line-strong)", background:"none", padding:"10px 20px", borderRadius:10, cursor:"pointer", fontFamily:"inherit" }}>Go back</button>
      </div>
    </div>
  );

  const pct = biz.target > 0 ? Math.round((biz.raised / biz.target) * 100) : 0;

  return (
    <div className="app" style={{ background: "var(--cream)" }}>
      <div className="statusbar-spacer" />

      <div className="scroll" style={{ paddingBottom: 100 }}>
        {/* hero photo */}
        <div style={{ position: "relative" }}>
          <Photo label={biz.photoLab} height={260} radius={0} color={`${biz.color}25`} />
          <div style={{ position: "absolute", top: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between" }}>
            <RoundBtn onClick={onBack} bg="rgba(255,252,245,0.95)" size={40}><Icon name="back" size={18} /></RoundBtn>
            <div className="row gap-8">
              <RoundBtn bg="rgba(255,252,245,0.95)" size={40}><Icon name="bell" size={16} /></RoundBtn>
              <RoundBtn bg="rgba(255,252,245,0.95)" size={40}><Icon name="send" size={16} /></RoundBtn>
            </div>
          </div>
          {/* match badge floating */}
          <div style={{
            position: "absolute", bottom: -28, right: 22,
            background: "var(--bone)", borderRadius: 999,
            padding: 8, boxShadow: "var(--shadow-md)",
          }}>
            <MatchDial score={biz.matchScore} size={56} />
          </div>
        </div>

        {/* identity */}
        <div className="pad" style={{ marginTop: 24 }}>
          <div className="row gap-6" style={{ marginBottom: 8, flexWrap: "wrap" }}>
            <span className="chip" style={{ background: `${biz.color}15`, color: biz.color }}>{biz.category}</span>
            <span className="chip outline">{biz.city}</span>
            <span className="chip forest"><Icon name="check" size={11} /> Verified</span>
          </div>
          <div className="h1" style={{ fontSize: 32 }}>{biz.business}</div>
          <div className="row gap-8" style={{ marginTop: 8, color: "var(--ink-2)" }}>
            <Avatar name={biz.name} initials={biz.initials} color={biz.color} size={26} />
            <span style={{ fontSize: 13.5 }}>{biz.name} · owner</span>
          </div>
        </div>

        {/* the pitch */}
        <div className="pad" style={{ marginTop: 18 }}>
          <div className="card" style={{ background: "var(--linen)" }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>The pitch</div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--ink)" }}>
              {biz.pitch}
            </p>
          </div>
        </div>

        {/* what investment is for */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="eyebrow" style={{ marginBottom: 6 }}>What the money does</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.2, color: "var(--ink)" }}>
              {biz.use}
            </div>
          </div>
        </div>

        {/* raise progress */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="card sand">
            <div className="row between" style={{ marginBottom: 10 }}>
              <div className="eyebrow">Raise progress</div>
              <span className="chip outline">{pct}%</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--ink)" }}>
              <span className="naira">{fmtNaira(biz.raised, { compact: true })}</span>
              <span style={{ color: "var(--ink-3)", fontSize: 18 }}> / {fmtNaira(biz.target, { compact: true })}</span>
            </div>
            <Progress value={pct} color={biz.color} height={8} />
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 8 }}>
              Closes when fully raised — typically 10–14 days.
            </div>
          </div>
        </div>

        {/* deal terms */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Deal terms</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <DetailRow icon="money" label="Investment range" value={fmtNairaRange(biz.askMin, biz.askMax)} />
            <DetailRow icon="trend-up" label="Return offered" value={biz.returnHeadline} />
            <DetailRow icon="bell" label="Reporting cadence" value={biz.cadence.join(" or ")} />
            <DetailRow icon="shield" label="Risk level" value={biz.risk} chip={
              biz.risk === "Low" ? "forest" : biz.risk === "Medium" ? "sun" : "clay"
            } />
            <DetailRow icon="calendar" label="Seasonality" value={biz.seasonality} last />
          </div>
        </div>

        {/* business stats */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>By the numbers</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <StatTile label="Years running" value={biz.yearsRunning} unit="yrs" />
            <StatTile label="Team" value={biz.employees} unit="people" />
            <StatTile label="Monthly revenue" value={`${fmtNaira(biz.monthlyRevenue.min/1000, {})}k–${fmtNaira(biz.monthlyRevenue.max/1000000, { decimals: 1 })}M`} />
            <StatTile label="Match score" value={`${biz.matchScore}%`} accent />
          </div>
        </div>

        {/* trust */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Trust signals</div>
          <div className="row gap-6" style={{ flexWrap: "wrap" }}>
            {biz.tags.map(t => (
              <span key={t} className="chip forest"><Icon name="check" size={11} /> {t}</span>
            ))}
          </div>
        </div>

        {/* what happens next */}
        <div className="pad" style={{ marginTop: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>If you proceed</div>
          <div className="col gap-10">
            <Step n="1" title="Review the Deal Summary" body="Plain-English terms, signed by both sides. No money moves yet." />
            <Step n="2" title="Fund into escrow" body="Held by a licensed partner. Released only when both sides confirm." />
            <Step n="3" title="Get monthly reports + payouts" body={`${biz.cadence[0]} updates and revenue-share payouts to your wallet.`} />
          </div>
        </div>
      </div>

      {/* fixed CTA */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        padding: "14px 16px 22px",
        background: "linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <button className="btn btn-primary btn-block"
          onClick={onInvest || onProceed}
          style={{ background: "var(--ink)", color: "var(--cream)" }}>
          Start a deal · {fmtNairaRange(biz.askMin, biz.askMax)}
        </button>
        <WhatsAppButton
          phone={biz.ownerPhone}
          name={biz.business}
          context="investor_to_business"
          style={{ borderRadius: 12 }}
        />
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, chip, last }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 16px",
      borderBottom: last ? 0 : "1px solid var(--line)",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: "var(--linen)", color: "var(--ink-2)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name={icon} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: 0.04, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 2 }}>{value}</div>
      </div>
      {chip && <span className={`chip ${chip}`}>{value.split("·")[0]}</span>}
    </div>
  );
}

function StatTile({ label, value, unit, accent }) {
  return (
    <div className="card" style={{ padding: 14, background: accent ? "var(--clay-tint)" : "var(--bone)" }}>
      <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: 0.04, textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 6, fontFamily: "var(--font-display)", fontSize: 22, color: accent ? "var(--clay-deep)" : "var(--ink)", lineHeight: 1.1 }}>
        {value}
        {unit && <span style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-body)", marginLeft: 4 }}>{unit}</span>}
      </div>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div className="row gap-12" style={{ alignItems: "flex-start" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 999,
        background: "var(--ink)", color: "var(--cream)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontSize: 14, flexShrink: 0,
      }}>{n}</div>
      <div>
        <div style={{ fontSize: 14.5, color: "var(--ink)", fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

Object.assign(window, { InvMatches, BizListCard, InvBusinessDetail, DetailRow, StatTile, Step });