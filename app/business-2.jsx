// business-2.jsx — Business: Investor detail, Counter-sign, Money received, Reporting flow, Investors tab, Profile builder.

// ─── INVESTOR DETAIL (offer review) ──────────────────────
function BizInvestorDetail({ investorId, onBack, onAccept }) {
  const interest = window.MM_DATA.interested.find(i => i.investorId === investorId);
  const inv = window.MM_DATA.investors.find(v => v.id === investorId);
  if (!inv) return null;

  return (
    <div className="app">
      <div className="statusbar-spacer" />
      <AppHeader title="Offer review"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        trailing={<RoundBtn><Icon name="send" size={16} /></RoundBtn>}
      />
      <div className="scroll" style={{ paddingBottom: 100 }}>
        {/* identity */}
        <div className="pad" style={{ paddingTop: 6, textAlign: "center" }}>
          <div style={{ display: "inline-block", position: "relative" }}>
            <Avatar name={inv.name} initials={inv.initials} color={inv.color} size={88} />
            <div style={{ position: "absolute", bottom: 0, right: 0 }}><VerifBadge size={22} /></div>
          </div>
          <div className="h1" style={{ fontSize: 28, marginTop: 14 }}>{inv.name}</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{inv.role}</div>
          <div className="row gap-6" style={{ justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
            <span className="chip forest"><Icon name="check" size={11} /> BVN verified</span>
            <span className="chip outline">{inv.portfolio} active deals</span>
          </div>
        </div>

        {/* offer */}
        <div className="pad" style={{ marginTop: 22 }}>
          <div className="card clay">
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Their offer to you</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 38, color: "#fff", lineHeight: 1.05 }} className="naira">
              {fmtNaira(interest?.offer.amount || 800000)}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
              {interest?.offer.terms}
            </div>
            <div className="hr" style={{ background: "rgba(255,255,255,0.18)", margin: "14px 0" }} />
            <div className="row between" style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)" }}>
              <span>Reporting · {interest?.offer.cadence}</span>
              <span>Type · {interest?.offer.type}</span>
            </div>
          </div>
        </div>

        {/* compatibility */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Compatibility check</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <CompatRow ok label="Amount overlap" detail={`Your ask ${fmtNairaRange(600000, 1200000)} fits their range`} />
            <CompatRow ok label="Return type" detail="Both: Revenue share" />
            <CompatRow ok label="Reporting cadence" detail="Both: Monthly" last />
          </div>
        </div>

        {/* about them */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>About {inv.name.split(" ")[0]}</div>
          <div className="card">
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ink)" }}>
              "{inv.bio}"
            </p>
            <div className="hr" style={{ margin: "14px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Mini label="Portfolio" value={`${inv.portfolio} deal${inv.portfolio === 1 ? "" : "s"}`} />
              <Mini label="Total deployed" value={fmtNaira(inv.deployed, { compact: true })} />
              <Mini label="Avg return" value={inv.avgReturn ? `${inv.avgReturn}%` : "—"} />
              <Mini label="Investing range" value={fmtNairaRange(inv.rangeMin, inv.rangeMax)} />
            </div>
          </div>
        </div>

        {/* their interests */}
        <div className="pad" style={{ marginTop: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>What they back</div>
          <div className="row gap-6" style={{ flexWrap: "wrap" }}>
            {inv.interests.map(t => <span key={t} className="chip">{t}</span>)}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 16px 22px",
                    background: "linear-gradient(180deg, rgba(247,241,232,0) 0%, var(--cream) 30%)" }}>
        <div className="row gap-8">
          <button className="btn btn-soft" style={{ flex: 1 }}>Counter-offer</button>
          <button className="btn btn-forest" style={{ flex: 1.5 }} onClick={onAccept}>Accept and start deal</button>
        </div>
      </div>
    </div>
  );
}

function CompatRow({ ok, label, detail, last }) {
  return (
    <div className="row gap-12" style={{ padding: "14px 16px", borderBottom: last ? 0 : "1px solid var(--line)" }}>
      <div style={{ width: 24, height: 24, borderRadius: 999, background: ok ? "var(--forest)" : "var(--clay)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={ok ? "check" : "close"} size={14} stroke={2.4} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{detail}</div>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, marginTop: 2, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}

// ─── BIZ DEAL SIGN + MONEY RECEIVED ──────────────────────
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

// ─── REPORTING FLOW (voice → structured) ──────────────
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

// ─── BIZ INVESTORS LIST ─────────────────────
function BizInvestors({ onPickInvestor }) {
  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14 }}>
        <div className="eyebrow">{window.MM_DATA.interested.length} interested</div>
        <div className="h1" style={{ fontSize: 36, marginTop: 6 }}>Investors</div>
      </div>
      <div className="pad col gap-10" style={{ marginTop: 18 }}>
        {window.MM_DATA.interested.map((it, i) => {
          const inv = window.MM_DATA.investors.find(v => v.id === it.investorId);
          return (
            <div key={it.investorId} className="fadein" style={{ animationDelay: `${i * 80}ms` }}>
              <OfferCard item={it} inv={inv} onClick={() => onPickInvestor(it.investorId)} highlight={it.status === "new" && i === 0} />
            </div>
          );
        })}
      </div>

      <div className="pad" style={{ marginTop: 18 }}>
        <div className="card linen" style={{ textAlign: "center", padding: "28px 18px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--ink)", lineHeight: 1.2 }}>
            More investors see your profile <span style={{ fontStyle: "italic", color: "var(--forest)" }}>when it's complete.</span>
          </div>
          <button className="btn btn-forest" style={{ marginTop: 14 }}>Polish profile</button>
        </div>
      </div>
    </div>
  );
}

// ─── BIZ PROFILE BUILDER ─────────────────────
function BizProfile({ user }) {
  const aisha = window.MM_DATA.businesses.find(b => b.id === "aisha");
  return (
    <div className="scroll" style={{ paddingBottom: 16 }}>
      <div className="pad" style={{ paddingTop: 14, textAlign: "center" }}>
        <Avatar name={user.name} initials="AB" color="var(--clay)" size={80} />
        <div className="h1" style={{ fontSize: 26, marginTop: 14 }}>{user.bizName || "Layi Bakehouse"}</div>
        <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{user.name} · Yaba, Lagos</div>
        <div className="row gap-6" style={{ justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          <span className="chip forest"><Icon name="check" size={11} /> Verified</span>
          <span className="chip clay">78% complete</span>
        </div>
      </div>

      <div className="pad" style={{ marginTop: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Your raise</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="money" label="Raising" value={fmtNairaRange(aisha.askMin, aisha.askMax)} />
          <DetailRow icon="trend-up" label="Offer" value={aisha.returnHeadline} />
          <DetailRow icon="bell" label="Reporting" value="Monthly" />
          <DetailRow icon="shop" label="What for" value={aisha.use} last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Business</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="calendar" label="Years running" value="3 years" />
          <DetailRow icon="user" label="Team" value="4 people" />
          <DetailRow icon="chart" label="Monthly revenue" value="₦850k–₦1.4M" />
          <DetailRow icon="doc" label="CAC registered" value="✓" last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Add-ons</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <DetailRow icon="sparkle" label="Pitch deck builder" value="₦8,000" />
          <DetailRow icon="shop" label="Product photography" value="From ₦25,000" last />
        </div>
      </div>

      <div className="pad" style={{ marginTop: 14 }}>
        <button className="btn btn-soft btn-block">Sign out</button>
      </div>
    </div>
  );
}

Object.assign(window, { BizInvestorDetail, BizDealSign, BizReporting, BizInvestors, BizProfile });
