// auth.jsx — MonieMatch authentication
// Sign up:  email + password + username (chosen by user)
// Sign in:  username OR email + password (app resolves username → email)
// Google:   OAuth redirect

(function() {

  async function signUp(email, password) {
    const { data, error } = await window.sb.auth.signUp({
      email: email.trim().toLowerCase(), password,
    });
    if (error) throw error;
    return data;
  }

  // Sign in with username OR email + password
  async function signIn(usernameOrEmail, password) {
    let email = usernameOrEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      // Look up email from username via DB function
      const { data, error } = await window.sb.rpc("get_email_by_username", { p_username: email });
      if (error || !data) throw new Error("Username not found.");
      email = data;
    }
    const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function changePassword(newPassword) {
    const { data, error } = await window.sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
    const { data: { user } } = await window.sb.auth.getUser();
    if (user) {
      await window.sb.from("users").update({ must_change_password: false }).eq("id", user.id);
    }
    return data;
  }

  async function resetPassword(email) {
    const { error } = await window.sb.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: window.location.origin + "/signin" }
    );
    if (error) throw error;
  }

  async function signInWithGoogle(role) {
    const dest = role === "investor" ? "/app/investor"
               : role === "business_owner" ? "/app/business" : "/app";
    const { error } = await window.sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + dest, queryParams: { prompt: "select_account" } },
    });
    if (error) throw error;
  }

  async function saveProfile(updates) {
    const { data: { user }, error: e } = await window.sb.auth.getUser();
    if (e || !user) throw new Error("Not authenticated");
    const { error } = await window.sb.from("users")
      .upsert({ id: user.id, email: user.email || null, ...updates }, { onConflict: "id" });
    if (error) throw error;
    return true;
  }

  async function saveInvestorProfile(data) {
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await window.sb.from("investors")
      .upsert({ user_id: user.id, ...data }, { onConflict: "user_id" });
    if (error) throw error;
  }

  async function saveBusinessProfile(data) {
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await window.sb.from("businesses")
      .upsert({ owner_id: user.id, ...data }, { onConflict: "owner_id" });
    if (error) throw error;
  }

  async function getSession() {
    const { data: { session } } = await window.sb.auth.getSession();
    return session;
  }

  async function signOut() { await window.sb.auth.signOut(); }

  window.MM_AUTH = {
    signUp, signIn, changePassword, resetPassword,
    signInWithGoogle, saveProfile, saveInvestorProfile,
    saveBusinessProfile, getSession, signOut,
  };

})();