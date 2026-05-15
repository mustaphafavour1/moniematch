// inv-matches.jsx — Investor matches list and business card component

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

Object.assign(window, { InvMatches, BizListCard });
