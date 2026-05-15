// new-screens.jsx — Priority missing screens
// Covers: InvPrefsSetup, KYCScreen, InvSearch, ReferralScreen, BizDocuments

// ─────────────────────────────────────────────────────────
// 1. INVESTOR PREFERENCES SETUP (post-onboarding, before home)
// ─────────────────────────────────────────────────────────
function InvPrefsSetup({ user, onDone }) {
  const allCats = ["Bakery","Fashion","Food","Barbing","Beauty","Repair","Retail","Laundry","Tailoring","Photography","Tech","Events"];
  const [cats, setCats]       = React.useState([]);
  const [minAmt, setMinAmt]   = React.useState("");
  const [maxAmt, setMaxAmt]   = React.useState("");
  const [returns, setReturns] = React.useState([]);
  const [urgency, setUrgency] = React.useState("");
  const [saving, setSaving]   = React.useState(false);

  const toggle = (arr, set, val) =>
    arr.includes(val) ? set(arr.filter(x => x !== val)) : set([...arr, val]);

  const fmtPreview = (v) => {
    const n = parseInt(v, 10);
    if (!v || isNaN(n)) return "";
    return n >= 1000000 ? `₦${(n/1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n/1000).toFixed(0)}k` : `₦${n}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (window.MM_AUTH) {
        await window.MM_AUTH.saveInvestorProfile({
          interests: cats,
          investment_range: `${fmtPreview(minAmt)} – ${fmtPreview(maxAmt)}`,
          return_structures: returns,
          city: user?.city,
          state: user?.state,
        });
      }
    } catch (e) { console.warn("[MM] prefs save:", e); }
    setSaving(false);
    onDone({ interests: cats, rangeMin: minAmt, rangeMax: maxAmt, returnStructures: returns });
  };

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Header */}
      <div style={{ padding:"52px 24px 0" }}>
        <div style={{ fontSize:11, fontWeight:600, color:"var(--clay)", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>
          2 min · No commitment
        </div>
        <div className="h1" style={{ fontSize:28, marginBottom:8 }}>
          Let's find your<br />
          <span style={{ fontStyle:"italic", color:"var(--clay)" }}>first match.</span>
        </div>
        <p style={{ fontSize:14, color:"var(--ink-2)", margin:0, lineHeight:1.5 }}>
          Set your preferences once. We surface the right businesses — you decide what happens next.
        </p>
      </div>

      <div className="scroll" style={{ flex:1, padding:"24px 24px 0" }}>

        {/* Amount range */}
        <div className="eyebrow" style={{ marginBottom:10 }}>How much do you want to invest? (₦)</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
          {[
            { label:"Minimum", val:minAmt, set:setMinAmt, ph:"100,000" },
            { label:"Maximum", val:maxAmt, set:setMaxAmt, ph:"1,000,000" },
          ].map(({ label, val, set, ph }) => (
            <div key={label}>
              <p style={{ fontSize:11.5, color:"var(--ink-3)", margin:"0 0 6px", fontWeight:500 }}>{label}</p>
              <div style={{ background:"var(--bone)", border:"1.5px solid var(--line-strong)", borderRadius:12, padding:"10px 13px", display:"flex", gap:4, alignItems:"center" }}>
                <span style={{ fontSize:14, color:"var(--ink-3)" }}>₦</span>
                <input type="number" value={val} onChange={e => set(e.target.value)} placeholder={ph}
                  style={{ flex:1, border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:14, color:"var(--ink)" }} />
              </div>
              {val && <p style={{ fontSize:11, color:"var(--clay)", margin:"3px 0 0", fontWeight:600 }}>{fmtPreview(val)}</p>}
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="eyebrow" style={{ marginBottom:10 }}>Business types I'm interested in</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:24 }}>
          {allCats.map(c => {
            const on = cats.includes(c);
            return (
              <button key={c} onClick={() => toggle(cats, setCats, c)} style={{
                appearance:"none", border:"1.5px solid", cursor:"pointer",
                borderColor: on ? "var(--clay)" : "var(--line-strong)",
                background: on ? "var(--clay-tint)" : "transparent",
                color: on ? "var(--clay)" : "var(--ink-2)",
                padding:"7px 14px", borderRadius:999, fontSize:13,
                fontWeight: on ? 600 : 500, fontFamily:"inherit", transition:"all 150ms",
              }}>{c}</button>
            );
          })}
        </div>

        {/* Return structures */}
        <div className="eyebrow" style={{ marginBottom:10 }}>Return structures I prefer</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
          {[
            { val:"Revenue share", desc:"% of monthly revenue until a total is reached" },
            { val:"Fixed return",  desc:"Set monthly repayment over an agreed timeline" },
            { val:"Either works",  desc:"Open to both — maximises match chances" },
          ].map(opt => {
            const on = returns.includes(opt.val);
            return (
              <div key={opt.val} onClick={() => toggle(returns, setReturns, opt.val)} style={{
                background: on ? "var(--clay-tint)" : "var(--bone)",
                border:`1.5px solid ${on ? "var(--clay)" : "var(--line-strong)"}`,
                borderRadius:12, padding:"12px 14px", cursor:"pointer",
                display:"flex", gap:10, alignItems:"flex-start", transition:"all 150ms",
              }}>
                <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${on ? "var(--clay)" : "var(--line-strong)"}`, background:on?"var(--clay)":"transparent", flexShrink:0, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {on && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 7 9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", margin:"0 0 2px" }}>{opt.val}</p>
                  <p style={{ fontSize:12, color:"var(--ink-3)", margin:0, lineHeight:1.4 }}>{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Urgency */}
        <div className="eyebrow" style={{ marginBottom:10 }}>How soon do you want to invest?</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:32 }}>
          {["Within a week","This month","Next 3 months","Just exploring"].map(u => {
            const on = urgency === u;
            return (
              <button key={u} onClick={() => setUrgency(u)} style={{
                appearance:"none", border:"1.5px solid", cursor:"pointer",
                borderColor: on ? "var(--clay)" : "var(--line-strong)",
                background: on ? "var(--clay-tint)" : "transparent",
                color: on ? "var(--clay)" : "var(--ink-2)",
                padding:"7px 14px", borderRadius:999, fontSize:13,
                fontWeight: on ? 600 : 500, fontFamily:"inherit", transition:"all 150ms",
              }}>{u}</button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:"12px 24px 28px", borderTop:"1px solid var(--line)", background:"var(--cream)" }}>
        <button onClick={handleSave} disabled={saving}
          className="btn btn-primary btn-block">
          {saving ? "Saving…" : cats.length > 0 || returns.length > 0 ? "Find my matches" : "Skip for now"}
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// 2. KYC — IDENTITY VERIFICATION PROMPT
// ─────────────────────────────────────────────────────────
function KYCScreen({ role, onBack, onVerified }) {
  const isBiz = role === "business";
  const accent = isBiz ? "var(--forest)" : "var(--clay)";
  const [method, setMethod] = React.useState("");
  const [bvn, setBvn]       = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone]     = React.useState(false);

  const handleVerify = async () => {
    if (!bvn || bvn.length < 11) return;
    setLoading(true);
    // In production: call a BVN verification API (e.g. Mono, Youverify, Dojah)
    await new Promise(r => setTimeout(r, 1800)); // simulate API call
    setLoading(false);
    setDone(true);
    setTimeout(() => onVerified && onVerified(), 1200);
  };

  if (done) {
    return (
      <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18, padding:"0 28px", height:"100%" }}>
        <div style={{ width:72, height:72, borderRadius:999, background:isBiz?"var(--forest-tint)":"var(--clay-tint)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon name="check" size={32} color={accent} />
        </div>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontFamily:"var(--font-display)", fontSize:24, color:"var(--ink)", margin:"0 0 8px" }}>Identity verified</p>
          <p style={{ fontSize:14, color:"var(--ink-3)", margin:0 }}>Your profile is now verified. Investors and businesses trust verified profiles more.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <AppHeader title="Verify identity" leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>} sticky />

      <div className="scroll" style={{ flex:1 }}>
        <div className="pad" style={{ paddingTop:20 }}>

          {/* Why verify */}
          <div style={{ background:isBiz?"var(--forest-tint)":"var(--clay-tint)", borderRadius:14, padding:"16px", marginBottom:24, display:"flex", gap:12 }}>
            <Icon name="shield" size={20} color={accent} />
            <div>
              <p style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", margin:"0 0 4px" }}>Verified profiles get 3× more matches</p>
              <p style={{ fontSize:12.5, color:"var(--ink-2)", margin:0, lineHeight:1.45 }}>
                Verification confirms you're who you say you are — builds trust with {isBiz ? "investors" : "business owners"} before money moves.
              </p>
            </div>
          </div>

          {/* Method selection */}
          <div className="eyebrow" style={{ marginBottom:12 }}>Choose verification method</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
            {[
              { val:"bvn", label:"BVN Verification", desc:"Bank Verification Number (11 digits)", recommended:true },
              { val:"nin", label:"NIN Verification", desc:"National Identity Number (11 digits)" },
            ].map(m => {
              const on = method === m.val;
              return (
                <div key={m.val} onClick={() => setMethod(m.val)} style={{
                  background: on ? (isBiz?"var(--forest-tint)":"var(--clay-tint)") : "var(--bone)",
                  border:`1.5px solid ${on ? accent : "var(--line-strong)"}`,
                  borderRadius:14, padding:"14px 16px", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:12, transition:"all 150ms",
                }}>
                  <div style={{ width:20, height:20, borderRadius:999, border:`2px solid ${on ? accent : "var(--line-strong)"}`, background:on?accent:"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {on && <div style={{ width:8, height:8, borderRadius:999, background:"#fff" }} />}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:2 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:"var(--ink)", margin:0 }}>{m.label}</p>
                      {m.recommended && <span style={{ fontSize:10, fontWeight:600, color:accent, background:isBiz?"var(--forest-tint)":"var(--clay-tint)", padding:"2px 7px", borderRadius:999 }}>Recommended</span>}
                    </div>
                    <p style={{ fontSize:12, color:"var(--ink-3)", margin:0 }}>{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Number input */}
          {method && (
            <div style={{ marginBottom:24 }}>
              <div className="eyebrow" style={{ marginBottom:10 }}>Enter your {method.toUpperCase()}</div>
              <div style={{ background:"var(--bone)", border:"1.5px solid var(--line-strong)", borderRadius:14, padding:"13px 16px", display:"flex", gap:10, alignItems:"center" }}>
                <Icon name="lock" size={16} color="var(--ink-3)" />
                <input
                  type="number" value={bvn} onChange={e => setBvn(e.target.value.slice(0,11))}
                  placeholder="Enter 11-digit number"
                  style={{ flex:1, border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:15, color:"var(--ink)", letterSpacing:"0.08em" }}
                />
                {bvn.length === 11 && <Icon name="check" size={16} color={accent} />}
              </div>
              <p style={{ fontSize:11.5, color:"var(--ink-4)", margin:"8px 0 0", lineHeight:1.4 }}>
                Your {method.toUpperCase()} is encrypted and used only for identity verification. MonieMatch never stores it in plain text.
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:"12px 22px 28px", borderTop:"1px solid var(--line)", background:"var(--cream)", display:"flex", flexDirection:"column", gap:10 }}>
        {method && (
          <button onClick={handleVerify} disabled={bvn.length < 11 || loading}
            style={{ width:"100%", padding:13, background:bvn.length===11?accent:"var(--line-strong)", color:bvn.length===11?"#fff":"var(--ink-3)", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:bvn.length===11?"pointer":"default", fontFamily:"inherit", transition:"all 200ms" }}>
            {loading ? "Verifying…" : "Verify my identity"}
          </button>
        )}
        <button onClick={onBack} style={{ appearance:"none", border:0, background:"none", color:"var(--ink-3)", fontSize:13, cursor:"pointer", fontFamily:"inherit", padding:"6px 0" }}>
          I'll do this later
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// 3. INVESTOR SEARCH / BROWSE ALL BUSINESSES
// ─────────────────────────────────────────────────────────
function InvSearch({ onPickBusiness, onBack }) {
  const allBiz = window.MM_DATA?.businesses || [];
  const [query, setQuery]       = React.useState("");
  const [catFilter, setCatFilter] = React.useState("");
  const [sortBy, setSortBy]     = React.useState("match"); // match | amount | newest

  const categories = [...new Set(allBiz.map(b => b.category))];

  const filtered = allBiz
    .filter(b => {
      const q = query.toLowerCase();
      const matchQ = !q || b.business.toLowerCase().includes(q) || b.category.toLowerCase().includes(q) || b.city.toLowerCase().includes(q);
      const matchCat = !catFilter || b.category === catFilter;
      return matchQ && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === "match")   return (b.matchScore || 0) - (a.matchScore || 0);
      if (sortBy === "amount")  return (b.askMax || 0) - (a.askMax || 0);
      return 0;
    });

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <AppHeader
        title="Browse businesses"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div style={{ padding:"12px 20px 0", borderBottom:"1px solid var(--line)" }}>
        {/* Search */}
        <div style={{ display:"flex", gap:10, alignItems:"center", background:"var(--bone)", border:"1.5px solid var(--line-strong)", borderRadius:12, padding:"10px 14px", marginBottom:12 }}>
          <Icon name="search" size={16} color="var(--ink-3)" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, category, city…"
            style={{ flex:1, border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:14, color:"var(--ink)" }}
          />
          {query && <button onClick={() => setQuery("")} style={{ appearance:"none", border:0, background:"none", cursor:"pointer", color:"var(--ink-3)", padding:0, lineHeight:1 }}>×</button>}
        </div>

        {/* Category filter */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:12, scrollbarWidth:"none" }}>
          <button onClick={() => setCatFilter("")} style={{
            appearance:"none", border:"1.5px solid", cursor:"pointer", whiteSpace:"nowrap",
            borderColor:!catFilter?"var(--clay)":"var(--line-strong)",
            background:!catFilter?"var(--clay-tint)":"transparent",
            color:!catFilter?"var(--clay)":"var(--ink-3)",
            padding:"6px 12px", borderRadius:999, fontSize:12, fontWeight:!catFilter?600:500, fontFamily:"inherit",
          }}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(catFilter===c?"":c)} style={{
              appearance:"none", border:"1.5px solid", cursor:"pointer", whiteSpace:"nowrap",
              borderColor:catFilter===c?"var(--clay)":"var(--line-strong)",
              background:catFilter===c?"var(--clay-tint)":"transparent",
              color:catFilter===c?"var(--clay)":"var(--ink-3)",
              padding:"6px 12px", borderRadius:999, fontSize:12, fontWeight:catFilter===c?600:500, fontFamily:"inherit",
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div className="scroll" style={{ flex:1 }}>
        <div className="pad" style={{ paddingTop:14 }}>

          {/* Sort + result count */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <span style={{ fontSize:12, color:"var(--ink-3)" }}>{filtered.length} {filtered.length===1?"business":"businesses"}</span>
            <div style={{ display:"flex", gap:5 }}>
              {[
                { val:"match",  label:"Best match" },
                { val:"amount", label:"Amount" },
              ].map(s => (
                <button key={s.val} onClick={() => setSortBy(s.val)} style={{
                  appearance:"none", border:"1px solid", cursor:"pointer",
                  borderColor:sortBy===s.val?"var(--clay)":"var(--line-strong)",
                  background:sortBy===s.val?"var(--clay-tint)":"transparent",
                  color:sortBy===s.val?"var(--clay)":"var(--ink-3)",
                  padding:"5px 10px", borderRadius:999, fontSize:11.5, fontWeight:sortBy===s.val?600:400, fontFamily:"inherit",
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Business list */}
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <p style={{ fontFamily:"var(--font-display)", fontSize:20, color:"var(--ink)", margin:"0 0 8px" }}>No matches</p>
              <p style={{ fontSize:13.5, color:"var(--ink-3)", margin:0 }}>Try a different search or remove the category filter.</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10, paddingBottom:32 }}>
              {filtered.map(b => (
                <MatchListRow key={b.id} biz={b} onClick={() => onPickBusiness(b.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// 4. BUSINESS DOCUMENTS — Upload CAC, Photos, Story
// ─────────────────────────────────────────────────────────
function BizDocuments({ onBack }) {
  const [cac, setCac]       = React.useState(false);
  const [photos, setPhotos] = React.useState(0);
  const [story, setStory]   = React.useState(false);
  const [recording, setRecording] = React.useState(false);

  const tasks = [
    { key:"cac",    done: cac,        pts:"+18% matches" },
    { key:"photos", done: photos >= 2, pts:"+12% matches" },
    { key:"story",  done: story,       pts:"+10% matches" },
  ];
  const doneCount = tasks.filter(t => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <AppHeader title="Profile documents" leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>} sticky />

      <div className="scroll" style={{ flex:1 }}>
        <div className="pad" style={{ paddingTop:16 }}>

          {/* Progress */}
          <div style={{ background:"var(--forest)", borderRadius:16, padding:"18px", marginBottom:22, color:"#fff" }}>
            <p style={{ fontSize:11, opacity:0.7, margin:"0 0 4px", fontWeight:600, textTransform:"uppercase", letterSpacing:0.7 }}>Profile strength</p>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12 }}>
              <p style={{ fontFamily:"var(--font-display)", fontSize:28, margin:0 }}>{pct}%</p>
              <p style={{ fontSize:12, opacity:0.7, margin:0 }}>{doneCount} of {tasks.length} done</p>
            </div>
            <div style={{ height:6, background:"rgba(255,255,255,0.2)", borderRadius:999, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${pct}%`, background:"var(--sun)", borderRadius:999, transition:"width 500ms" }} />
            </div>
          </div>

          {/* CAC */}
          <div className="eyebrow" style={{ marginBottom:10 }}>CAC Certificate</div>
          <div className="card" style={{ padding:"16px", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background: cac?"var(--forest-tint)":"rgba(31,26,20,0.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon name="doc" size={20} color={cac?"var(--forest)":"var(--ink-3)"} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:600, color:"var(--ink)", margin:"0 0 3px" }}>Business registration certificate</p>
                <p style={{ fontSize:12, color:"var(--ink-3)", margin:"0 0 12px", lineHeight:1.4 }}>
                  {cac ? "Uploaded ✓ — Pending review" : "Upload your CAC certificate or Business Name certificate. Accepted: PDF, JPG, PNG."}
                </p>
                {!cac ? (
                  <button onClick={() => setCac(true)} style={{ appearance:"none", border:"1.5px solid var(--forest)", background:"var(--forest-tint)", color:"var(--forest)", padding:"8px 16px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                    Upload document
                  </button>
                ) : (
                  <span style={{ fontSize:12, color:"var(--forest)", fontWeight:600 }}>✓ cac-certificate.pdf · 2.1MB</span>
                )}
              </div>
            </div>
          </div>

          {/* Shop photos */}
          <div className="eyebrow" style={{ marginBottom:10 }}>Shop photos ({photos}/2 minimum)</div>
          <div className="card" style={{ padding:"16px", marginBottom:16 }}>
            <p style={{ fontSize:13, color:"var(--ink-2)", margin:"0 0 14px", lineHeight:1.45 }}>
              Real photos of your shop, products, or team. Profiles with 2+ photos get significantly more investor interest.
            </p>
            <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
              {[0,1,2,3].map(i => (
                <button key={i} onClick={() => setPhotos(p => Math.min(4, i < photos ? photos : i+1))} style={{
                  width:72, height:72, borderRadius:12, cursor:"pointer",
                  border: i < photos ? "2px solid var(--forest)" : "2px dashed var(--line-strong)",
                  background: i < photos ? "var(--forest-tint)" : "var(--bone)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0,
                }}>
                  {i < photos
                    ? <Icon name="check" size={20} color="var(--forest)" />
                    : <span style={{ fontSize:22, color:"var(--line-strong)" }}>+</span>
                  }
                </button>
              ))}
            </div>
            {photos >= 2 && (
              <p style={{ fontSize:12, color:"var(--forest)", fontWeight:600, margin:0 }}>✓ {photos} photo{photos>1?"s":""} added</p>
            )}
          </div>

          {/* Founder story */}
          <div className="eyebrow" style={{ marginBottom:10 }}>Founder story (60-second voice note)</div>
          <div className="card" style={{ padding:"16px", marginBottom:32 }}>
            <p style={{ fontSize:13, color:"var(--ink-2)", margin:"0 0 14px", lineHeight:1.45 }}>
              Tell investors why you started this business, what it means to you, and where you're taking it. We transcribe it automatically.
            </p>
            {story ? (
              <div style={{ background:"var(--forest-tint)", borderRadius:10, padding:"12px 14px", display:"flex", gap:10, alignItems:"center" }}>
                <Icon name="mic" size={18} color="var(--forest)" />
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"var(--forest)", margin:"0 0 2px" }}>Story recorded · 58 seconds</p>
                  <p style={{ fontSize:11.5, color:"var(--forest)", margin:0, opacity:0.8 }}>Transcription in progress…</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setRecording(true); setTimeout(() => { setRecording(false); setStory(true); }, 2000); }}
                style={{ width:"100%", padding:"13px", border:"none", borderRadius:12, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8, background: recording?"var(--clay)":"var(--ink)", color:"#fff", transition:"background 200ms" }}>
                <Icon name="mic" size={18} color="#fff" />
                {recording ? "Recording… tap to stop" : "Start recording"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// 5. REFERRAL SCREEN (shared — investor and business)
// ─────────────────────────────────────────────────────────
function ReferralScreen({ user, role, onBack }) {
  const isBiz      = role === "business";
  const accent     = isBiz ? "var(--forest)" : "var(--clay)";
  const accentTint = isBiz ? "var(--forest-tint)" : "var(--clay-tint)";
  const refCode    = (user?.name || "USER").replace(/\s+/g,"").slice(0,6).toUpperCase() + "23";
  const refLink    = `https://moniematch.vercel.app/join-${isBiz?"business":"investor"}?ref=${refCode}`;
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(refLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = isBiz
      ? `I'm raising investment for my business on MonieMatch. It's structured, fair, and built for Nigerian small businesses. Join with my link: ${refLink}`
      : `I just started investing in Nigerian small businesses through MonieMatch. Real shops, real returns, structured deals. Use my link: ${refLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Mock referral stats
  const stats = { joined: 3, active: 1, earned: 0 };

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <AppHeader title="Refer & earn" leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>} sticky />

      <div className="scroll" style={{ flex:1 }}>
        <div className="pad" style={{ paddingTop:16 }}>

          {/* Hero */}
          <div style={{ background:isBiz?"var(--forest)":"var(--clay)", borderRadius:18, padding:"22px 20px", marginBottom:20, color:"#fff" }}>
            <p style={{ fontSize:11.5, opacity:0.75, margin:"0 0 6px", fontWeight:600, textTransform:"uppercase", letterSpacing:0.7 }}>
              {isBiz ? "Refer other business owners" : "Refer investors"}
            </p>
            <p style={{ fontFamily:"var(--font-display)", fontSize:26, margin:"0 0 8px", lineHeight:1.2 }}>
              {isBiz ? "Help your neighbour get funded." : "Grow the community."}
            </p>
            <p style={{ fontSize:13.5, opacity:0.85, margin:"0 0 18px", lineHeight:1.5 }}>
              {isBiz
                ? "Know another business owner who deserves investment? Share your link. When they join and get funded, you both benefit."
                : "Invite other investors to back Nigerian small businesses. The more investors, the better the matches for everyone."
              }
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[
                { label:"Joined", val:stats.joined },
                { label:"Active", val:stats.active },
                { label:"Earned", val:`₦${stats.earned.toLocaleString()}` },
              ].map(({ label, val }) => (
                <div key={label} style={{ background:"rgba(255,255,255,0.15)", borderRadius:10, padding:"10px 10px", textAlign:"center" }}>
                  <p style={{ fontFamily:"var(--font-display)", fontSize:20, margin:"0 0 2px" }}>{val}</p>
                  <p style={{ fontSize:10.5, opacity:0.75, margin:0, fontWeight:500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Referral link */}
          <div className="eyebrow" style={{ marginBottom:10 }}>Your referral link</div>
          <div style={{ background:"var(--bone)", border:"1.5px solid var(--line-strong)", borderRadius:14, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
            <p style={{ flex:1, fontSize:13, color:"var(--ink-2)", margin:0, wordBreak:"break-all", lineHeight:1.4 }}>{refLink}</p>
            <button onClick={copy} style={{ appearance:"none", border:0, background:copied?accentTint:"var(--bone)", color:copied?accent:"var(--ink-3)", borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0, transition:"all 180ms" }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Share buttons */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
            <button onClick={shareWhatsApp} style={{ width:"100%", padding:13, border:"none", borderRadius:12, background:"#25D366", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share on WhatsApp
            </button>
            <button onClick={copy} style={{ width:"100%", padding:13, border:`1.5px solid ${accent}`, borderRadius:12, background:accentTint, color:accent, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              {copied ? "✓ Link copied!" : "Copy referral link"}
            </button>
          </div>

          {/* How it works */}
          <div className="eyebrow" style={{ marginBottom:12 }}>How it works</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:32 }}>
            {[
              { n:"1", title:"Share your link", body:"Send it to a friend, post it in a group, or DM it directly." },
              { n:"2", title:"They join MonieMatch", body:"They sign up through your link and complete their profile." },
              { n:"3", title:"You both benefit", body:"When their first deal closes, rewards are distributed to both of you." },
            ].map(s => (
              <div key={s.n} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:28, height:28, borderRadius:999, background:accentTint, color:accent, fontSize:13, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"var(--font-display)" }}>{s.n}</div>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", margin:"0 0 2px" }}>{s.title}</p>
                  <p style={{ fontSize:12.5, color:"var(--ink-3)", margin:0, lineHeight:1.4 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InvPrefsSetup, KYCScreen, InvSearch, BizDocuments, ReferralScreen });