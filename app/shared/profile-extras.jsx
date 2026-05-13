// profile-extras.jsx
// 1. InvRequirements  — investor's checklist for business requirements
// 2. BizProfileLinks  — business social links, catalogue, website
// 3. WhatsAppButton   — communication button for both sides

// ─────────────────────────────────────────────────────────
// 1. INVESTOR REQUIREMENTS CHECKLIST
// ─────────────────────────────────────────────────────────
function InvRequirements({ user, onBack, onSave }) {
  const PRESET = [
    { id: "cac",        label: "CAC registered",                    group: "Legal" },
    { id: "profitable", label: "Business is profitable",            group: "Financial" },
    { id: "revenue_min",label: "Monthly revenue above ₦100,000",    group: "Financial" },
    { id: "bank_acct",  label: "Has active business bank account",  group: "Financial" },
    { id: "pos",        label: "Uses POS or accepts digital payment",group: "Financial" },
    { id: "same_city",  label: "Based in same city as me",          group: "Location" },
    { id: "same_state", label: "Based in same state as me",         group: "Location" },
    { id: "photos",     label: "Has at least 2 shop photos",        group: "Profile" },
    { id: "founder_story", label: "Has recorded a founder story",   group: "Profile" },
    { id: "duration_6", label: "In business for at least 6 months", group: "Profile" },
    { id: "duration_1", label: "In business for at least 1 year",   group: "Profile" },
    { id: "team",       label: "Has at least 1 full-time employee",  group: "Team" },
    { id: "no_other_debt", label: "No outstanding unpaid loans",    group: "Financial" },
    { id: "clear_use",  label: "Has clear plan for investment funds", group: "Profile" },
  ];

  const groups = [...new Set(PRESET.map(p => p.group))];

  const [checked, setChecked] = React.useState(user?.requirements?.checked || []);
  const [custom, setCustom]   = React.useState(user?.requirements?.custom || "");
  const [saving, setSaving]   = React.useState(false);

  const toggle = (id) =>
    setChecked(cs => cs.includes(id) ? cs.filter(x => x !== id) : [...cs, id]);

  const handleSave = async () => {
    setSaving(true);
    const requirements = { checked, custom: custom.trim() };
    try {
      if (window.MM_AUTH) {
        await window.MM_AUTH.saveInvestorProfile({ requirements: JSON.stringify(requirements) });
      }
    } catch (e) { console.warn("[MM] requirements save:", e); }
    setSaving(false);
    onSave && onSave(requirements);
  };

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <AppHeader
        title="Investment requirements"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex:1 }}>
        <div className="pad" style={{ paddingTop:12 }}>

          <p style={{ fontSize:14, color:"var(--ink-2)", lineHeight:1.55, margin:"0 0 20px" }}>
            Set the minimum conditions a business should meet before you invest. Businesses that don't meet your requirements will appear lower in your match list.
          </p>

          {groups.map(group => (
            <div key={group} style={{ marginBottom:20 }}>
              <div className="eyebrow" style={{ marginBottom:10 }}>{group}</div>
              <div className="card" style={{ padding:"0 14px" }}>
                {PRESET.filter(p => p.group === group).map((item, i, arr) => (
                  <div key={item.id}
                    onClick={() => toggle(item.id)}
                    style={{
                      display:"flex", alignItems:"center", gap:12,
                      padding:"13px 0",
                      borderBottom: i < arr.length-1 ? "1px solid var(--line)" : "none",
                      cursor:"pointer",
                    }}>
                    {/* Checkbox */}
                    <div style={{
                      width:20, height:20, borderRadius:5, flexShrink:0,
                      border:`2px solid ${checked.includes(item.id) ? "var(--clay)" : "var(--line-strong)"}`,
                      background: checked.includes(item.id) ? "var(--clay)" : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 150ms",
                    }}>
                      {checked.includes(item.id) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 7 9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <p style={{ fontSize:14, color:"var(--ink)", margin:0, lineHeight:1.4, flex:1 }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Custom requirement */}
          <div className="eyebrow" style={{ marginBottom:10 }}>Other requirements</div>
          <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:14, padding:"12px 14px", marginBottom:28 }}>
            <textarea
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="e.g. Must have at least 200 Instagram followers. Must be in the food sector. Must have a physical shop."
              rows={4}
              style={{ width:"100%", border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:14, color:"var(--ink)", resize:"none", lineHeight:1.5 }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding:"12px 22px 28px", borderTop:"1px solid var(--line)", background:"var(--cream)" }}>
        <p style={{ fontSize:12, color:"var(--ink-3)", margin:"0 0 12px", lineHeight:1.4, textAlign:"center" }}>
          {checked.length === 0 && !custom
            ? "No requirements set — you'll see all businesses."
            : `${checked.length} requirement${checked.length !== 1 ? "s" : ""} set${custom ? " + custom note" : ""}`
          }
        </p>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-block">
          {saving ? "Saving…" : "Save requirements"}
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// 2. BUSINESS PROFILE LINKS — socials, catalogue, website
// ─────────────────────────────────────────────────────────
function BizProfileLinks({ user, onBack, onSave }) {
  const [instagram,  setInstagram]  = React.useState(user?.links?.instagram  || "");
  const [tiktok,     setTiktok]     = React.useState(user?.links?.tiktok     || "");
  const [facebook,   setFacebook]   = React.useState(user?.links?.facebook   || "");
  const [twitter,    setTwitter]    = React.useState(user?.links?.twitter    || "");
  const [website,    setWebsite]    = React.useState(user?.links?.website    || "");
  const [whatsapp,   setWhatsapp]   = React.useState(user?.links?.whatsapp   || "");
  const [catalogue,  setCatalogue]  = React.useState(user?.links?.catalogue  || "");
  const [catalogueDesc, setCatalogueDesc] = React.useState(user?.links?.catalogueDesc || "");
  const [saving, setSaving]         = React.useState(false);
  const [media, setMedia]           = React.useState(user?.media || []); // uploaded images

  const handleSave = async () => {
    setSaving(true);
    const links = { instagram, tiktok, facebook, twitter, website, whatsapp, catalogue, catalogueDesc };
    try {
      if (window.MM_AUTH) {
        await window.MM_AUTH.saveBusinessProfile({ links: JSON.stringify(links) });
      }
    } catch (e) { console.warn("[MM] links save:", e); }
    setSaving(false);
    onSave && onSave({ links });
  };

  const socials = [
    { key:"instagram",  label:"Instagram",  placeholder:"@yourbusiness",    icon:"📸", prefix:"instagram.com/" },
    { key:"tiktok",     label:"TikTok",     placeholder:"@yourbusiness",    icon:"🎵", prefix:"tiktok.com/@" },
    { key:"facebook",   label:"Facebook",   placeholder:"facebook.com/...", icon:"💬", prefix:"" },
    { key:"twitter",    label:"Twitter / X",placeholder:"@yourbusiness",    icon:"𝕏",  prefix:"x.com/" },
    { key:"whatsapp",   label:"WhatsApp Business", placeholder:"08012345678", icon:"💚", prefix:"+234" },
    { key:"website",    label:"Website",    placeholder:"yourshop.com",     icon:"🌐", prefix:"" },
  ];

  const vals = { instagram, tiktok, facebook, twitter, whatsapp, website };
  const sets  = { instagram:setInstagram, tiktok:setTiktok, facebook:setFacebook, twitter:setTwitter, whatsapp:setWhatsapp, website:setWebsite };

  return (
    <div className="app cream-bg" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <AppHeader
        title="Links & catalogue"
        leading={<RoundBtn onClick={onBack}><Icon name="back" size={18} /></RoundBtn>}
        sticky
      />

      <div className="scroll" style={{ flex:1 }}>
        <div className="pad" style={{ paddingTop:12 }}>

          {/* Social links */}
          <div className="eyebrow" style={{ marginBottom:10 }}>Social media & contact</div>
          <div className="card" style={{ padding:"0 14px", marginBottom:20 }}>
            {socials.map((s, i) => (
              <div key={s.key} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"13px 0",
                borderBottom: i < socials.length-1 ? "1px solid var(--line)" : "none",
              }}>
                <span style={{ fontSize:18, width:24, textAlign:"center", flexShrink:0 }}>{s.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:11, color:"var(--ink-3)", margin:"0 0 3px", fontWeight:500 }}>{s.label}</p>
                  <input
                    value={vals[s.key]}
                    onChange={e => sets[s.key](e.target.value)}
                    placeholder={s.placeholder}
                    style={{ width:"100%", border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:14, color:"var(--ink)", padding:0 }}
                  />
                </div>
                {vals[s.key] && (
                  <button onClick={() => sets[s.key]("")}
                    style={{ appearance:"none", border:0, background:"none", color:"var(--ink-4)", cursor:"pointer", fontSize:16, padding:0 }}>×</button>
                )}
              </div>
            ))}
          </div>

          {/* Product catalogue */}
          <div className="eyebrow" style={{ marginBottom:10 }}>Product catalogue</div>
          <div className="card" style={{ padding:"14px 16px", marginBottom:20 }}>
            <p style={{ fontSize:13, color:"var(--ink-2)", margin:"0 0 12px", lineHeight:1.45 }}>
              Share a link to your catalogue — Google Drive folder, Instagram highlights, Jumia store, or any URL investors can browse.
            </p>
            <div style={{ background:"var(--bone)", border:"1.5px solid var(--line-strong)", borderRadius:12, padding:"10px 13px", display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <span style={{ fontSize:16 }}>🔗</span>
              <input
                value={catalogue}
                onChange={e => setCatalogue(e.target.value)}
                placeholder="https://drive.google.com/..."
                style={{ flex:1, border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:14, color:"var(--ink)" }}
              />
            </div>
            <div style={{ background:"var(--bone)", border:"1px solid var(--line-strong)", borderRadius:12, padding:"10px 13px" }}>
              <input
                value={catalogueDesc}
                onChange={e => setCatalogueDesc(e.target.value)}
                placeholder="Briefly describe what's in this catalogue"
                style={{ width:"100%", border:0, background:"transparent", outline:"none", fontFamily:"inherit", fontSize:13, color:"var(--ink-2)" }}
              />
            </div>
          </div>

          {/* Media uploads */}
          <div className="eyebrow" style={{ marginBottom:10 }}>Shop photos & videos</div>
          <div className="card" style={{ padding:"14px 16px", marginBottom:32 }}>
            <p style={{ fontSize:13, color:"var(--ink-2)", margin:"0 0 14px", lineHeight:1.45 }}>
              Show investors what your shop looks like. Real photos increase match quality significantly.
            </p>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
              {media.map((m, i) => (
                <div key={i} style={{ width:80, height:80, borderRadius:12, background:"var(--forest-tint)", overflow:"hidden", position:"relative", flexShrink:0 }}>
                  <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name="doc" size={24} color="var(--forest)" />
                  </div>
                  <button onClick={() => setMedia(ms => ms.filter((_, j) => j !== i))}
                    style={{ position:"absolute", top:4, right:4, width:18, height:18, borderRadius:999, background:"rgba(31,26,20,0.6)", border:0, color:"#fff", fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                </div>
              ))}
              {/* Add photo button */}
              <button
                onClick={() => setMedia(ms => [...ms, { type:"photo", name:`Photo ${ms.length+1}` }])}
                style={{ width:80, height:80, flexShrink:0, borderRadius:12, border:"2px dashed var(--line-strong)", background:"var(--bone)", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                <span style={{ fontSize:22, color:"var(--ink-4)" }}>+</span>
                <span style={{ fontSize:10, color:"var(--ink-4)", fontWeight:500 }}>Photo</span>
              </button>
            </div>
            <p style={{ fontSize:11.5, color:"var(--ink-4)", margin:0 }}>
              Tap to add · JPG, PNG, MP4 · Max 10MB per file
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:"12px 22px 28px", borderTop:"1px solid var(--line)", background:"var(--cream)" }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-forest btn-block">
          {saving ? "Saving…" : "Save links"}
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────
// 3. WHATSAPP BUTTON — communication between parties
// ─────────────────────────────────────────────────────────

// Used on InvBusinessDetail and BizInvestorDetail
function WhatsAppButton({ phone, name, context, style: extraStyle }) {
  if (!phone) return null;

  // Format phone for WhatsApp
  const formatted = phone.replace(/\D/g, "");
  const waNumber  = formatted.startsWith("234") ? formatted : `234${formatted.replace(/^0/, "")}`;

  // Pre-filled message based on context
  const messages = {
    investor_to_business: `Hi, I'm interested in investing in ${name || "your business"} through MonieMatch. Can we discuss the details?`,
    business_to_investor: `Hi ${name || "there"}, I saw your interest in my business on MonieMatch. I'd love to tell you more. When's a good time to chat?`,
  };
  const message = messages[context] || `Hi, I found you on MonieMatch.`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a href={waUrl} target="_blank" rel="noopener noreferrer"
      style={{
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        padding:"12px 20px", borderRadius:12,
        background:"#25D366", color:"#fff",
        textDecoration:"none", fontFamily:"inherit",
        fontSize:14, fontWeight:600,
        ...extraStyle,
      }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Message on WhatsApp
    </a>
  );
}

// ─── Social link display row (for viewing profiles) ───────
function SocialLinks({ links }) {
  if (!links) return null;
  let parsed = links;
  if (typeof links === "string") {
    try { parsed = JSON.parse(links); } catch { return null; }
  }

  const items = [
    { key:"instagram", icon:"📸", label:"Instagram", base:"instagram.com/" },
    { key:"tiktok",    icon:"🎵", label:"TikTok",    base:"tiktok.com/@" },
    { key:"facebook",  icon:"💬", label:"Facebook",  base:"" },
    { key:"twitter",   icon:"𝕏",  label:"Twitter",   base:"x.com/" },
    { key:"website",   icon:"🌐", label:"Website",   base:"" },
    { key:"whatsapp",  icon:"💚", label:"WhatsApp",  base:"wa.me/234" },
  ].filter(item => parsed[item.key]);

  if (items.length === 0) return null;

  return (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {items.map(item => {
        const val = parsed[item.key];
        const href = item.key === "whatsapp"
          ? `https://wa.me/234${val.replace(/\D/g,"").replace(/^0/,"")}`
          : item.key === "website"
          ? (val.startsWith("http") ? val : `https://${val}`)
          : `https://${item.base}${val.replace("@","")}`;

        return (
          <a key={item.key} href={href} target="_blank" rel="noopener noreferrer"
            style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"7px 12px", borderRadius:999,
              background:"var(--bone)", border:"1px solid var(--line-strong)",
              color:"var(--ink)", textDecoration:"none",
              fontSize:12.5, fontWeight:500, fontFamily:"inherit",
            }}>
            <span style={{ fontSize:14 }}>{item.icon}</span>
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

// ─── Catalogue link display ───────────────────────────────
function CatalogueLink({ links }) {
  if (!links) return null;
  let parsed = links;
  if (typeof links === "string") {
    try { parsed = JSON.parse(links); } catch { return null; }
  }
  if (!parsed.catalogue) return null;

  return (
    <a href={parsed.catalogue} target="_blank" rel="noopener noreferrer"
      style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"12px 14px", borderRadius:12,
        background:"var(--sun-tint)", border:"1px solid var(--line-strong)",
        color:"var(--ink)", textDecoration:"none", fontFamily:"inherit",
      }}>
      <span style={{ fontSize:18 }}>🔗</span>
      <div>
        <p style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", margin:"0 0 1px" }}>View catalogue</p>
        <p style={{ fontSize:12, color:"var(--ink-3)", margin:0 }}>
          {parsed.catalogueDesc || "See products and services"}
        </p>
      </div>
      <Icon name="fwd" size={14} color="var(--ink-3)" style={{ marginLeft:"auto" }} />
    </a>
  );
}

Object.assign(window, {
  InvRequirements,
  BizProfileLinks,
  WhatsAppButton,
  SocialLinks,
  CatalogueLink,
});