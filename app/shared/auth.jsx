// auth.jsx — MonieMatch auth helpers
// Now supports: email OTP + Google OAuth (phone removed)

(function() {

  // ── Send email OTP ──────────────────────────────────────
  async function sendEmailOTP(email) {
    const { error } = await window.sb.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
    return email.trim().toLowerCase();
  }

  // ── Verify email OTP (6-digit code) ────────────────────
  async function verifyEmailOTP(email, token) {
    const { data, error } = await window.sb.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token:  token.trim(),
      type:  "email",
    });
    if (error) throw error;
    return data; // { user, session }
  }

  // ── Sign in with Google ─────────────────────────────────
  async function signInWithGoogle(role) {
    // role: 'investor' | 'business_owner'
    // redirectTo: after Google auth, user lands on the right app
    const dest = role === "investor" ? "/app/investor" : "/app/business";
    const { error } = await window.sb.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + dest,
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) throw error;
    // Google will redirect the page — no return value needed
  }

  // ── Save / update user profile ──────────────────────────
  async function saveProfile(updates) {
    const { data: { user }, error: userErr } = await window.sb.auth.getUser();
    if (userErr || !user) throw new Error("Not authenticated");
    const { error } = await window.sb
      .from("users")
      .upsert({ id: user.id, email: user.email, ...updates }, { onConflict: "id" });
    if (error) throw error;
    return true;
  }

  // ── Get current user profile ────────────────────────────
  async function getProfile() {
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) return null;
    const { data } = await window.sb
      .from("users").select("*").eq("id", user.id).maybeSingle();
    return data;
  }

  // ── Check session ───────────────────────────────────────
  async function getSession() {
    const { data: { session } } = await window.sb.auth.getSession();
    return session;
  }

  // ── Sign out ────────────────────────────────────────────
  async function signOut() {
    await window.sb.auth.signOut();
  }

  // ── Save business profile ───────────────────────────────
  async function saveBusinessProfile(data) {
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await window.sb
      .from("businesses")
      .upsert({ owner_id: user.id, ...data }, { onConflict: "owner_id" });
    if (error) throw error;
    return true;
  }

  // ── Save investor profile ───────────────────────────────
  async function saveInvestorProfile(data) {
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await window.sb
      .from("investors")
      .upsert({ user_id: user.id, ...data }, { onConflict: "user_id" });
    if (error) throw error;
    return true;
  }

  window.MM_AUTH = {
    sendEmailOTP,
    verifyEmailOTP,
    signInWithGoogle,
    saveProfile,
    getProfile,
    getSession,
    signOut,
    saveBusinessProfile,
    saveInvestorProfile,
  };

})();