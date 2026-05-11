// auth.jsx — MonieMatch Supabase auth helpers
// Loaded before all screen files so functions are globally available.
// Usage: window.MM_AUTH.sendOTP(phone) / window.MM_AUTH.verifyOTP(phone, token)

(function() {

  // ── Format phone to E.164 (+234...) ─────────────────────
  function formatPhone(raw) {
    const digits = raw.replace(/\D/g, '');
    // If starts with 0, strip and add +234
    if (digits.startsWith('0')) return '+234' + digits.slice(1);
    // If already has country code
    if (digits.startsWith('234')) return '+' + digits;
    return '+234' + digits;
  }

  // ── Send OTP via Supabase + Twilio ───────────────────────
  async function sendOTP(rawPhone) {
    const phone = formatPhone(rawPhone);
    const { error } = await window.sb.auth.signInWithOtp({ phone });
    if (error) throw error;
    return phone; // return formatted phone so we can use it in verifyOTP
  }

  // ── Verify OTP and get session ───────────────────────────
  async function verifyOTP(formattedPhone, tokenArray) {
    const token = Array.isArray(tokenArray) ? tokenArray.join('') : tokenArray;
    const { data, error } = await window.sb.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return data; // { user, session }
  }

  // ── Save / update user profile ───────────────────────────
  async function saveProfile(updates) {
    const { data: { user }, error: userErr } = await window.sb.auth.getUser();
    if (userErr || !user) throw new Error('Not authenticated');

    const { error } = await window.sb
      .from('users')
      .upsert({ id: user.id, ...updates }, { onConflict: 'id' });

    if (error) throw error;
    return true;
  }

  // ── Get current user profile from DB ────────────────────
  async function getProfile() {
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) return null;

    const { data, error } = await window.sb
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) console.warn('[MM] getProfile error:', error);
    return data;
  }

  // ── Check if user is already logged in ──────────────────
  async function getSession() {
    const { data: { session } } = await window.sb.auth.getSession();
    return session;
  }

  // ── Sign out ─────────────────────────────────────────────
  async function signOut() {
    await window.sb.auth.signOut();
  }

  // ── Save business profile ────────────────────────────────
  async function saveBusinessProfile(data) {
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await window.sb
      .from('businesses')
      .upsert({ owner_id: user.id, ...data }, { onConflict: 'owner_id' });

    if (error) throw error;
    return true;
  }

  // ── Save investor profile ────────────────────────────────
  async function saveInvestorProfile(data) {
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await window.sb
      .from('investors')
      .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' });

    if (error) throw error;
    return true;
  }

  // ── Expose globally ──────────────────────────────────────
  window.MM_AUTH = {
    formatPhone,
    sendOTP,
    verifyOTP,
    saveProfile,
    getProfile,
    getSession,
    signOut,
    saveBusinessProfile,
    saveInvestorProfile,
  };

})();