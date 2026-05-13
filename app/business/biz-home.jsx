// biz-home.jsx — Business owner home screen, investor offer cards

function BizHome({ user, interested: propInterested, onPickInvestor, onTab, onStartReport, onNotifications = () => {}, onFundingProgress = () => {} }) {
  const loading    = propInterested === null;
  const isDemoMode = propInterested === undefined;
  const interested = isDemoMode
    ? (window.MM_DATA?.interested || [])
    : (propInterested || []);

  const newOffers  = interested.filter(i => i.status === "new" || !i.status).slice(0, 3);
  const raised     = user?.raised || 0;
  const target     = user?.target || 1200000;
  const bizName    = user?.bizName || user?.business || "your business";
  const profilePct = 78;
  const userName   = user?.name || "Owner";
  const userInitials = userName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const userColor  = user?.color || "var(--clay)";

  if (loading) {
    const S = window.MM_SKEL;
    return S ? <S.SkeletonHome light /> : null;
  }

  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
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

      {/* hero — investor interest */}
      <div className="pad fadein" style={{ marginTop: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Today · {newOffers.length} new {newOffers.length === 1 ? "offer" : "offers"}
        </div>
        <div className="h1" style={{ fontSize: 32 }}>
          {newOffers.length > 0
            ? <>{newOffers.length === 1 ? "One investor wants" : `${newOffers.length} investors want`} a piece of <span style={{ fontStyle: "italic", color: "var(--forest)" }}>{bizName}.</span></>
            : <>Your profile is <span style={{ fontStyle: "italic", color: "var(--forest)" }}>live and visible.</span></>
          }
        </div>
      </div>

      {/* offers stack */}
      {newOffers.length > 0 && (
        <div className="pad fadein d1" style={{ marginTop: 18 }}>
          <div className="col gap-10">
            {newOffers.map((it, i) => {
              const inv = window.MM_DATA?.investors?.find(v => v.id === it.investorId) || it;
              return (
                <div key={it.matchId || it.investorId || i} className="fadein" style={{ animationDelay: `${i * 80}ms` }}>
                  <OfferCard item={it} inv={inv} onClick={() => onPickInvestor(it.userId || it.investorId)} highlight={i === 0} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* raise progress */}
      <div className="pad fadein d2" style={{ marginTop: 22 }}>
        <div className="card forest" onClick={onFundingProgress} style={{ cursor: "pointer" }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>Your active raise</div>
            <div className="row gap-4" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span style={{ fontSize: 11 }}>View detail</span>
              <Icon name="fwd" size={13} />
            </div>
          </div>
          <div className="row between" style={{ alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 0.04 }}>Raised</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, color: "#fff" }}>
                <AnimatedNaira value={raised} />
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>of {fmtNaira(target, { compact: true })} target</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <ProgressRing value={target > 0 ? (raised/target)*100 : 0} size={56} stroke={5} color="var(--sun)" trackColor="rgba(255,255,255,0.15)">
                <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#fff" }}>{target > 0 ? Math.round((raised/target)*100) : 0}%</span>
              </ProgressRing>
            </div>
          </div>
          {target > raised && (
            <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(0,0,0,0.16)", borderRadius: 10, fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>
              <Icon name="sparkle" size={12} /> {fmtNaira(target - raised, { compact: true })} more closes the round.
            </div>
          )}
        </div>
      </div>

      {/* report due */}
      <div className="pad fadein d3" style={{ marginTop: 14 }}>
        <div onClick={onStartReport} className="card sand" style={{ cursor: "pointer" }}>
          <div className="row between">
            <div className="row gap-12">
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--clay)", color: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="mic" size={20} />
              </div>
              <div className="col">
                <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.04 }}>April report due in 2 days</div>
                <div style={{ fontSize: 15, color: "var(--ink)", fontWeight: 500 }}>Speak it. We'll write it.</div>
              </div>
            </div>
            <Icon name="fwd" size={16} color="var(--ink-3)" />
          </div>
        </div>
      </div>

      {/* profile completeness */}
      <div className="pad fadein d4" style={{ marginTop: 22 }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div className="eyebrow">Make your profile irresistible</div>
        </div>
        <div className="card">
          <div className="row gap-14">
            <ProgressRing value={profilePct} size={56} stroke={5} color="var(--forest)">
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)" }}>{profilePct}%</span>
            </ProgressRing>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>3 things left</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>POS link · 2 photos · founder story</div>
            </div>
          </div>
          <div className="hr" style={{ margin: "14px 0" }} />
          <div className="col gap-10">
            <ProfileTask label="Connect Moniepoint POS" subtitle="Pulls last 90 days automatically" badge="+12% match" />
            <ProfileTask label="Add 2 shop photos" subtitle="Investors stay on profile 3× longer with photos" />
            <ProfileTask label="Record your founder story" subtitle="60-second voice note. We'll transcribe." />
          </div>
        </div>
      </div>

      {/* learn */}
      <div className="pad fadein d5" style={{ marginTop: 22 }}>
        <div className="card linen">
          <div className="eyebrow" style={{ marginBottom: 8 }}>Coming soon</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)", lineHeight: 1.2 }}>
            CAC registration support, in 5 days, ₦15,000.
          </div>
          <button className="btn btn-soft" style={{ marginTop: 12, padding: "10px 14px", fontSize: 13 }}>Tell me more</button>
        </div>
      </div>
    </div>
  );
}

function OfferCard({ item, inv, onClick, highlight }) {
  const dim = item.status === "viewing";
  return (
    <div onClick={onClick} className="card" style={{
      padding: 14, cursor: "pointer",
      background: highlight ? "var(--bone)" : "var(--bone)",
      borderColor: highlight ? "var(--forest)" : "var(--line)",
      borderWidth: highlight ? 1.5 : 1,
      opacity: dim ? 0.65 : 1,
    }}>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div className="row gap-12">
          <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={42} />
          <div className="col">
            <div className="row gap-6" style={{ marginBottom: 2 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{inv.name}</div>
              {item.status === "new" && <span className="chip clay" style={{ padding: "2px 8px", fontSize: 10 }}>New</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{inv.role}</div>
          </div>
        </div>
        <div className="col" style={{ alignItems: "flex-end" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)" }} className="naira">
            {fmtNaira(item.offer.amount, { compact: true })}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{relTime(item.whenISO)}</div>
        </div>
      </div>
      <div className="hr" style={{ margin: "12px 0" }} />
      <div className="row between" style={{ fontSize: 12.5 }}>
        <div className="row gap-6"><Icon name="trend-up" size={14} color="var(--ink-3)" /> <span>{item.offer.terms}</span></div>
      </div>
    </div>
  );
}

function ProfileTask({ label, subtitle, badge }) {
  return (
    <div className="row gap-12" style={{ alignItems: "center" }}>
      <div style={{ width: 24, height: 24, borderRadius: 999, border: "1.5px solid var(--line-strong)", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row between">
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
          {badge && <span className="chip forest" style={{ padding: "2px 8px", fontSize: 10 }}>{badge}</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
}


Object.assign(window, { BizHome, OfferCard, ProfileTask });
