// db.jsx — All Supabase query functions + data adapters
// Replaces window.MM_DATA with real DB data.
// Exposed as window.DB

(function () {

  // ── Deterministic colour from a string ─────────────────
  const PALETTE = ["#B45A3C","#2D5D3F","#6B3F4E","#E5A04A","#4A6B6E","#7A4F3D","#3B5998","#8B4513"];
  function colorFor(str) {
    let h = 0;
    for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
    return PALETTE[h % PALETTE.length];
  }
  function initialsFor(name) {
    return (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }

  // ── Parse "₦500k – ₦1.2M" → { min, max } ────────────
  function parseNairaRange(str) {
    if (!str) return { min: 0, max: 0 };
    const parts = str.split(/[–-]/).map(s => s.trim());
    const parse = s => {
      if (!s) return 0;
      const m = s.replace(/[₦,\s]/g, "").match(/([\d.]+)([kKmM]?)/);
      if (!m) return 0;
      const n = parseFloat(m[1]);
      const mul = /[kK]/.test(m[2]) ? 1000 : /[mM]/.test(m[2]) ? 1000000 : 1;
      return Math.round(n * mul);
    };
    return { min: parse(parts[0]), max: parse(parts[1] || parts[0]) };
  }

  // ── Adapt a businesses DB row → UI shape ──────────────
  function adaptBusiness(biz, matchScore) {
    const range   = parseNairaRange(biz.investment_needed);
    const structs = (biz.return_structures || []);
    const returnH = structs.length
      ? structs[0] + (biz.reporting_cadence?.[0] ? ` · ${biz.reporting_cadence[0].toLowerCase()} updates` : "")
      : "Terms TBD";

    return {
      id:            biz.id,
      business:      biz.name,
      category:      biz.category || "Business",
      city:          biz.city || "Nigeria",
      state:         biz.state || "",
      use:           biz.use_of_funds || biz.description || "",
      description:   biz.description || "",
      revenue:       biz.revenue_range || "",
      returnHeadline: returnH,
      returnStructures: structs,
      reportingCadence: biz.reporting_cadence || [],
      askMin:        range.min,
      askMax:        range.max,
      matchScore:    matchScore || biz.compatibility_score || 0,
      color:         colorFor(biz.name),
      initials:      initialsFor(biz.name),
      photoLab:      biz.category || "Business",
      raised:        biz.raised || 0,
      target:        range.max || 1000000,
      isVerified:    biz.is_verified || false,
      duration:      biz.duration || "",
      ownerId:       biz.owner_id,
    };
  }

  // ── Adapt an investors DB row → UI shape ──────────────
  function adaptInvestor(inv, userRow, matchScore) {
    const name = userRow?.name || inv.name || "Investor";
    return {
      id:              inv.id,
      userId:          inv.user_id,
      name:            name,
      role:            userRow?.occupation || "Investor",
      city:            userRow?.city || inv.city || "Nigeria",
      state:           userRow?.state || inv.state || "",
      interests:       inv.interests || [],
      investmentRange: inv.investment_range || "",
      returnStructures: inv.return_structures || [],
      reportingCadence: inv.reporting_cadence || [],
      matchScore:      matchScore || inv.compatibility_score || 0,
      initials:        initialsFor(name),
      color:           colorFor(name),
      isVerified:      inv.is_verified || false,
    };
  }


  // ══════════════════════════════════════════════════════
  // QUERY FUNCTIONS
  // ══════════════════════════════════════════════════════

  // ── Current user profile (merged users + investor/business) ──
  async function getMyProfile() {
    const { data: { user: authUser } } = await window.sb.auth.getUser();
    if (!authUser) return null;

    const { data: userRow } = await window.sb
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!userRow) return null;

    if (userRow.role === "investor") {
      const { data: inv } = await window.sb
        .from("investors")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      return {
        ...userRow,
        ...(inv || {}),
        investorId:      inv?.id,
        investmentRange: inv?.investment_range || "",
        interests:       inv?.interests || [],
        returnStructures: inv?.return_structures || [],
        reportingCadence: inv?.reporting_cadence || [],
        initials:        initialsFor(userRow.name),
        color:           colorFor(userRow.name),
      };
    }

    if (userRow.role === "business_owner") {
      const { data: biz } = await window.sb
        .from("businesses")
        .select("*")
        .eq("owner_id", authUser.id)
        .maybeSingle();

      return {
        ...userRow,
        ...(biz ? adaptBusiness(biz, 0) : {}),
        bizName:    biz?.name,
        businessId: biz?.id,
        initials:   initialsFor(userRow.name),
        color:      colorFor(userRow.name),
      };
    }

    return userRow;
  }

  // ── Investor: my matches (businesses matched to me) ────
  async function getMyMatches() {
    const { data: { user: authUser } } = await window.sb.auth.getUser();
    if (!authUser) return [];

    // Get investor row
    const { data: inv } = await window.sb
      .from("investors")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (!inv) return [];

    const { data: matches } = await window.sb
      .from("matches")
      .select(`
        id, compatibility_score, status,
        businesses (
          id, name, category, city, state,
          description, investment_needed, use_of_funds,
          return_structures, reporting_cadence, revenue_range,
          is_verified, duration
        )
      `)
      .eq("investor_id", inv.id)
      .in("status", ["pending", "viewed", "interested"])
      .order("compatibility_score", { ascending: false })
      .limit(30);

    if (!matches) return [];

    return matches
      .filter(m => m.businesses)
      .map(m => adaptBusiness(m.businesses, m.compatibility_score));
  }

  // ── Business: investors interested in my business ──────
  async function getInterestedInvestors() {
    const { data: { user: authUser } } = await window.sb.auth.getUser();
    if (!authUser) return [];

    // Get business row
    const { data: biz } = await window.sb
      .from("businesses")
      .select("id")
      .eq("owner_id", authUser.id)
      .maybeSingle();

    if (!biz) return [];

    const { data: matches } = await window.sb
      .from("matches")
      .select(`
        id, compatibility_score, status, created_at,
        investors (
          id, user_id, investment_range, interests,
          return_structures, reporting_cadence, is_verified,
          users (id, name, phone, city, state, occupation)
        )
      `)
      .eq("business_id", biz.id)
      .in("status", ["pending", "viewed", "interested", "negotiating"])
      .order("compatibility_score", { ascending: false })
      .limit(20);

    if (!matches) return [];

    return matches
      .filter(m => m.investors)
      .map(m => {
        const inv = m.investors;
        const u   = inv.users || {};
        return {
          ...adaptInvestor(inv, u, m.compatibility_score),
          matchId:   m.id,
          status:    m.status,
          whenISO:   m.created_at,
          offer: {
            amount: parseNairaRange(inv.investment_range).max || 500000,
            terms:  (inv.return_structures?.[0] || "Revenue share"),
          },
        };
      });
  }

  // ── Get a single business by ID ────────────────────────
  async function getBusinessById(bizId) {
    const { data: biz } = await window.sb
      .from("businesses")
      .select(`
        *,
        users (id, name, phone, city, state, avatar_url)
      `)
      .eq("id", bizId)
      .maybeSingle();

    if (!biz) return null;
    return {
      ...adaptBusiness(biz, 0),
      ownerName:  biz.users?.name,
      ownerPhone: biz.users?.phone,
    };
  }

  // ── Get a single investor by ID ────────────────────────
  async function getInvestorById(invId) {
    const { data: inv } = await window.sb
      .from("investors")
      .select(`
        *,
        users (id, name, phone, city, state, occupation, avatar_url)
      `)
      .eq("id", invId)
      .maybeSingle();

    if (!inv) return null;
    return adaptInvestor(inv, inv.users || {}, 0);
  }

  // ── Get investor's portfolio (active deals) ───────────
  async function getMyPortfolio() {
    const { data: { user: authUser } } = await window.sb.auth.getUser();
    if (!authUser) return [];

    const { data: inv } = await window.sb
      .from("investors")
      .select("id")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (!inv) return [];

    const { data: deals } = await window.sb
      .from("deals")
      .select(`
        *,
        matches (
          business_id,
          businesses (id, name, category, city, state)
        )
      `)
      .in("status", ["active", "signed", "proposed"])
      .limit(20);

    if (!deals) return [];
    return deals.map(d => ({
      dealId:   d.id,
      amount:   d.amount,
      status:   d.status,
      returnType: d.return_type,
      biz:      d.matches?.businesses
        ? adaptBusiness(d.matches.businesses, 0)
        : null,
    }));
  }

  // ── Get all businesses (for search/browse) ────────────
  async function getAllBusinesses() {
    const { data: businesses } = await window.sb
      .from("businesses")
      .select("*")
      .eq("is_verified", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!businesses) return [];
    return businesses.map(b => adaptBusiness(b, 0));
  }

  // ── Get notifications for current user ────────────────
  async function getNotifications() {
    const { data: { user: authUser } } = await window.sb.auth.getUser();
    if (!authUser) return [];

    const { data: notifs } = await window.sb
      .from("notifications")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(30);

    return notifs || [];
  }

  // ── Mark notification as read ─────────────────────────
  async function markNotificationRead(notifId) {
    await window.sb
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notifId);
  }

  // ── Get reports for a deal ─────────────────────────────
  async function getReports(dealId) {
    const { data: reports } = await window.sb
      .from("reports")
      .select("*")
      .eq("deal_id", dealId)
      .order("submitted_at", { ascending: false });

    return reports || [];
  }

  // ── Submit a report ───────────────────────────────────
  async function submitReport({ dealId, businessId, revenue, narrative, challenges }) {
    const { data, error } = await window.sb
      .from("reports")
      .insert({
        deal_id:           dealId,
        business_id:       businessId,
        revenue_this_period: revenue,
        narrative:         narrative,
        challenges:        challenges,
        submitted_at:      new Date().toISOString(),
      });

    if (error) throw error;
    return data;
  }

  // ── Update match status (e.g. investor views a business) ─
  async function updateMatchStatus(matchId, status) {
    await window.sb
      .from("matches")
      .update({ status })
      .eq("id", matchId);
  }

  // ── Expose globally ───────────────────────────────────
  window.DB = {
    getMyProfile,
    getMyMatches,
    getInterestedInvestors,
    getBusinessById,
    getInvestorById,
    getMyPortfolio,
    getAllBusinesses,
    getNotifications,
    markNotificationRead,
    getReports,
    submitReport,
    updateMatchStatus,
    // Utils exposed for screens
    adaptBusiness,
    adaptInvestor,
    colorFor,
    initialsFor,
    parseNairaRange,
  };

})();