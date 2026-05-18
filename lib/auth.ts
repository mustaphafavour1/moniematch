import { supabase } from './supabase'

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password })
  if (error) throw error
  return data
}

export async function signIn(usernameOrEmail: string, password: string) {
  let email = usernameOrEmail.trim().toLowerCase()
  if (!email.includes('@')) {
    const { data, error } = await supabase.rpc('get_email_by_username', { p_username: email })
    if (error || !data) throw new Error('Username not found.')
    email = data as string
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signInWithGoogle(role: 'investor' | 'business_owner') {
  const dest = role === 'investor' ? '/investor' : '/business'
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + dest, queryParams: { prompt: 'select_account' } },
  })
  if (error) throw error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function saveProfile(updates: Record<string, unknown>) {
  const { data: { user }, error: e } = await supabase.auth.getUser()
  if (e || !user) throw new Error('Not authenticated')
  const { error } = await supabase.from('users')
    .upsert({ id: user.id, email: user.email || null, ...updates }, { onConflict: 'id' })
  if (error) throw error

  // Keep city/state in sync with role-specific tables so matches show correct location
  if (updates.city !== undefined || updates.state !== undefined) {
    const cityState: Record<string, unknown> = {}
    if (updates.city  !== undefined) cityState.city  = updates.city
    if (updates.state !== undefined) cityState.state = updates.state
    const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
    if (roleRow?.role === 'investor') {
      await supabase.from('investors').update(cityState).eq('user_id', user.id)
    } else if (roleRow?.role === 'business_owner') {
      await supabase.from('businesses').update(cityState).eq('owner_id', user.id)
    }
  }
}

export async function saveInvestorProfile(data: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('investors')
    .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function saveBusinessProfile(data: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('businesses')
    .upsert({ owner_id: user.id, ...data }, { onConflict: 'owner_id' })
  if (error) throw error
}

export async function changePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  const { data: { user } } = await supabase.auth.getUser()
  if (user) await supabase.from('users').update({ must_change_password: false }).eq('id', user.id)
  return data
}

export async function getSettings(): Promise<Record<string, unknown>> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}
  const { data } = await supabase.from('users').select('settings')
    .or(`id.eq.${user.id},auth_uid.eq.${user.id}`).maybeSingle()
  return (data?.settings as Record<string, unknown>) || {}
}

export async function saveSettings(settings: Record<string, unknown>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  // Find user row (supports seeded accounts with auth_uid)
  const { data: userRow } = await supabase.from('users').select('id')
    .or(`id.eq.${user.id},auth_uid.eq.${user.id}`).maybeSingle()
  const rowId = userRow?.id || user.id
  const { error } = await supabase.from('users').update({ settings }).eq('id', rowId)
  if (error) throw error
}

export async function setInvestorAllowContact(allow: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: userRow } = await supabase.from('users').select('id')
    .or(`id.eq.${user.id},auth_uid.eq.${user.id}`).maybeSingle()
  const profileId = userRow?.id || user.id
  await supabase.from('investors').update({ allow_biz_msg: allow }).eq('user_id', profileId)
}

export async function setBusinessVisibility(visible: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: userRow } = await supabase.from('users').select('id')
    .or(`id.eq.${user.id},auth_uid.eq.${user.id}`).maybeSingle()
  const profileId = userRow?.id || user.id
  await supabase.from('businesses').update({ is_visible: visible }).eq('owner_id', profileId)
}
