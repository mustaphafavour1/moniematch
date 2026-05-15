// inv-home.jsx — Investor home screen, match cards

function InvHome({ user, matches: propMatches, onPickBusiness, onTab, onNotifications = () => {} }) {
  // propMatches meanings:
  // null        = still loading (show skeleton)
  // undefined   = demo mode, no auth (use mock data)
  // []          = authenticated but no matches yet (show empty state)
  // [...]       = real matches
  const loading    = propMatches === null;
  const isDemoMode = propMatches === undefined;
  const allMatches = isDemoMode
    ? (window.MM_DATA?.businesses || []).slice(0, 5)   // demo: show mock
    : (propMatches || []);                              // real: use actual (may be empty)

  const todayMatches = allMatches.slice(0, 2);
  const newThisWeek  = allMatches.slice(2, 5);
  const userName      = user?.name || "Investor";
  const userInitials  = (user?.initials) || userName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const userColor     = user?.color || "var(--forest)";

  if (loading) {
    return window.MM_SKEL ? <window.MM_SKEL.SkeletonHome light /> : null;
  }

  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      {/* header */}
      <div className="pad" style={{ paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="row gap-10">
          <Avatar name={userName} initials={userInitials} color={userColor} size={36} />
          <div className="col">
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{greet()}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{userName.split(" ")[0]}</div>
          </div>
        </div>
        <RoundBtn onClick={onNotifications}><Icon name="bell" size={18} /></RoundBtn>
      </div>

      {/* hero — today's matches headline card */}
      <div className="pad fadein" style={{ marginTop: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10, fontSize: "9px" }}>
          Today · {todayMatches.length} {todayMatches.length === 1 ? "match" : "new matches"}
        </div>
        <div className="h1" style={{ fontSize: "28px" }}>
          {todayMatches.length > 0
            ? <>{todayMatches.length === 1 ? "One business is" : `${todayMatches.length} businesses are`} looking for the kind of capital <span style={{ fontStyle: "italic", color: "var(--clay)", fontSize: "27px" }}>you bring.</span></>
            : <>Your matches are<br /><span style={{ fontStyle: "italic", color: "var(--clay)" }}>being calculated.</span></>
          }
        </div>
      </div>

      {/* match carousel */}
      <div className="fadein d1" style={{ marginTop: 18, paddingLeft: 22, overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 12, paddingRight: 22 }}>
          {todayMatches.length > 0
            ? todayMatches.map((b, i) => <MatchHeroCard key={b.id} biz={b} onClick={() => onPickBusiness(b.id)} index={i} />)
            : <div style={{ padding:"32px 20px", color:"var(--ink-3)", fontSize:14 }}>No matches yet — complete your profile to unlock them.</div>
          }
        </div>
      </div>

      {/* portfolio strip */}
      <div className="pad fadein d2" style={{ marginTop: 22 }}>
        <div className="card ink" onClick={() => onTab("portfolio")} style={{ cursor: "pointer" }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="eyebrow" style={{ color: "rgba(255,252,245,0.55)" }}>Your portfolio</div>
            <div className="row gap-4" style={{ color: "rgba(255,252,245,0.6)" }}>
              <span style={{ fontSize: 12 }}>View</span>
              <Icon name="fwd" size={14} />
            </div>
          </div>
          <div className="row between" style={{ alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,252,245,0.55)", letterSpacing: 0.04 }}>Deployed</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "var(--cream)", lineHeight: 1.05 }}>
                <AnimatedNaira value={2400000} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(255,252,245,0.55)", letterSpacing: 0.04 }}>Avg return</div>
              <div className="row gap-4" style={{ color: "var(--sun)", fontSize: 18, fontWeight: 500, justifyContent: "flex-end" }}>
                <Icon name="trend-up" size={16} /> 11.2%
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
            <div style={{ flex: 7, height: 6, borderRadius: 999, background: "var(--clay)" }} />
            <div style={{ flex: 4, height: 6, borderRadius: 999, background: "var(--sun)" }} />
            <div style={{ flex: 2, height: 6, borderRadius: 999, background: "var(--forest-soft)" }} />
          </div>
          <div className="row between" style={{ fontSize: 11, color: "rgba(255,252,245,0.6)", marginTop: 8 }}>
            <span>Fashion</span><span>Food</span><span>Barbing</span>
          </div>
        </div>
      </div>

      {/* upcoming payout */}
      <div className="pad fadein d3" style={{ marginTop: 14 }}>
        <div className="card sand">
          <div className="row between">
            <div className="row gap-12">
              <Avatar name="Tunde" initials="TO" color="var(--forest)" size={42} />
              <div className="col">
                <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: 0.04, textTransform: "uppercase" }}>Next payout · May 15</div>
                <div style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>Studio Adunni</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }}>₦92,000</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>est. revenue share</div>
            </div>
          </div>
        </div>
      </div>

      {/* new this week */}
      <div className="pad fadein d4" style={{ marginTop: 24 }}>
        <div className="row between" style={{ marginBottom: 14 }}>
          <div className="eyebrow">New this week</div>
          <div onClick={() => onTab("matches")} style={{ fontSize: 12, color: "var(--clay)", fontWeight: 500, cursor: "pointer" }}>See all</div>
        </div>
        <div className="col gap-10">
          {newThisWeek.length > 0
            ? newThisWeek.map((b) => <MatchListRow key={b.id} biz={b} onClick={() => onPickBusiness(b.id)} />)
            : <div style={{ fontSize:13.5, color:"var(--ink-3)", padding:"8px 0" }}>More businesses coming soon.</div>
          }
        </div>
      </div>

      {/* profile completion nudge */}
      <div className="pad fadein d5" style={{ marginTop: 22 }}>
        <div style={{
          background: "var(--linen)",
          borderRadius: 20, padding: "16px 18px",
          display: "flex", alignItems: "center", gap: 14,
          border: "1px dashed var(--line-strong)"
        }}>
          <ProgressRing value={20} size={42} stroke={4} color="var(--clay)">
            <span style={{ fontSize: 11, fontFamily: "var(--font-display)", color: "var(--ink)" }}>20%</span>
          </ProgressRing>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>Finish your investor profile</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>3 mins. Lets owners decide faster.</div>
          </div>
          <Icon name="fwd" size={16} color="var(--ink-3)" />
        </div>
      </div>
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Up early";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function MatchHeroCard({ biz, onClick, index = 0 }) {
  return (
    <div onClick={onClick} className="fadein"
      style={{
        width: 260, flexShrink: 0,
        background: "var(--bone)",
        borderRadius: 24, padding: 14,
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--line)",
        cursor: "pointer",
        animationDelay: `${index * 80}ms`
      }}>
      <Photo label={biz.photoLab} height={140} radius={14} color={`${biz.color}15`} accent={
        <div style={{
          background: "var(--bone)", borderRadius: 999, padding: "4px 10px",
          fontSize: 10.5, fontWeight: 500, color: "var(--ink)", boxShadow: "var(--shadow-sm)"
        }}>{biz.matchScore}% match</div>
      } />
      <div style={{ marginTop: 12 }}>
        <div className="row gap-6" style={{ marginBottom: 6 }}>
          <span className="chip" style={{ background: `${biz.color}18`, color: biz.color }}>{biz.category}</span>
          <span className="chip outline">{biz.city}</span>
        </div>
        <div style={{ fontFamily: "var(--font-display)", color: "var(--ink)", lineHeight: 1.1, fontSize: "20px" }}>
          {biz.business}
        </div>
        <div style={{ color: "var(--ink-2)", marginTop: 4, lineHeight: 1.45, fontSize: "11px", margin: "4px 0px 0px" }}>
          {biz.use}
        </div>
        <div className="hr" style={{ margin: "12px 0" }} />
        <div className="row between">
          <div className="col">
            <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: 0.05, textTransform: "uppercase" }}>Raising</div>
            <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }} className="naira">{fmtNairaRange(biz.askMin, biz.askMax)}</div>
          </div>
          <div className="col" style={{ alignItems: "flex-end" }}>
            <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: 0.05, textTransform: "uppercase" }}>Offer</div>
            <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{biz.returnHeadline.split(" · ")[0]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchListRow({ biz, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "var(--bone)", borderRadius: 18, padding: 12,
      display: "flex", alignItems: "center", gap: 12,
      border: "1px solid var(--line)", cursor: "pointer"
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `${biz.color}20`, color: biz.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontSize: 22,
        position: "relative", overflow: "hidden", flexShrink: 0
      }}>
        <span style={{ position: "relative", zIndex: 1 }}>{biz.initials}</span>
        <span style={{ position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(135deg, transparent 0 6px, rgba(31,26,20,0.04) 6px 7px)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row between">
          <div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{biz.business}</div>
          <div style={{ fontSize: 11, color: "var(--clay)", fontWeight: 500 }}>{biz.matchScore}%</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {biz.category} · {biz.city} · {biz.returnHeadline.split(" · ")[0]}
        </div>
      </div>
      <Icon name="fwd" size={14} color="var(--ink-3)" />
    </div>
  );
}


Object.assign(window, { InvHome, MatchHeroCard, MatchListRow, greet });
