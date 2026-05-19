import { supabase } from './supabase'
import type { Business, Investor, UserProfile, Deal, Report, Notification, ChatMessage, ChatThread } from './types'
import { colorFor, initialsFor, parseNairaRange } from './utils'

// ── Adapters ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptBusiness(biz: any, matchScore = 0): Business {
  const range   = parseNairaRange(biz.investment_needed)
  const structs: string[] = biz.return_structures || []
  const returnH = structs.length
    ? structs[0] + (biz.reporting_cadence?.[0] ? ` · ${biz.reporting_cadence[0].toLowerCase()} updates` : '')
    : 'Terms TBD'

  return {
    id:               biz.id,
    business:         biz.name,
    category:         biz.category || 'Business',
    city:             biz.city || 'Nigeria',
    state:            biz.state || '',
    use:              biz.use_of_funds || biz.description || '',
    description:      biz.description || '',
    revenue:          biz.revenue_range || '',
    returnHeadline:   returnH,
    returnStructures: structs,
    reportingCadence: biz.reporting_cadence || [],
    cadence:          biz.reporting_cadence || ['Monthly'],
    askMin:           range.min,
    askMax:           range.max,
    matchScore:       matchScore || biz.compatibility_score || 0,
    color:            colorFor(biz.name),
    initials:         initialsFor(biz.name),
    photoLab:         biz.category || 'Business',
    raised:           biz.raised || 0,
    target:           range.max || 1_000_000,
    isVerified:       biz.is_verified || false,
    duration:         biz.duration || '',
    ownerId:          biz.owner_id,
    ownerName:        biz.users?.name,
    ownerPhone:       biz.users?.phone,
    ownerAvatar:      biz.users?.avatar_url,
    name:             biz.users?.name,
    risk:             'Medium',
    seasonality:      'Year-round',
    yearsRunning:     1,
    employees:        2,
    monthlyRevenue:   { min: 200_000, max: 800_000 },
    tags:             ['ID Verified', 'Active Business', 'Bank Linked'],
    pitch:            biz.description || '',
    banner_url:       biz.banner_url || null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptInvestor(inv: any, userRow: any = {}, matchScore = 0): Investor {
  const name = userRow?.name || inv.name || 'Investor'
  return {
    id:               inv.id,
    userId:           inv.user_id,
    name,
    role:             userRow?.occupation || 'Investor',
    city:             userRow?.city || inv.city || 'Nigeria',
    state:            userRow?.state || inv.state || '',
    interests:        inv.interests || [],
    investmentRange:  inv.investment_range || '',
    returnStructures: inv.return_structures || [],
    reportingCadence: inv.reporting_cadence || [],
    matchScore:       matchScore || inv.compatibility_score || 0,
    initials:         initialsFor(name),
    color:            colorFor(name),
    isVerified:       inv.is_verified || false,
    avatar_url:       userRow?.avatar_url || undefined,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Module-level cache — survives SPA navigation, cleared on profile save
let _profileCache: UserProfile | null = null
export function clearProfileCache() { _profileCache = null }

// Resolve the seeded-user profileId: users.id may differ from auth UUID
async function getProfileId(): Promise<{ authId: string; profileId: string } | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null
  const { data: userRow } = await supabase.from('users').select('id')
    .or(`id.eq.${authUser.id},auth_uid.eq.${authUser.id}`).maybeSingle()
  return { authId: authUser.id, profileId: userRow?.id || authUser.id }
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<UserProfile | null> {
  if (_profileCache) return _profileCache

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  // Support both normal accounts (users.id = auth.id) and seeded accounts (users.auth_uid = auth.id)
  const { data: userRow } = await supabase
    .from('users').select('*')
    .or(`id.eq.${authUser.id},auth_uid.eq.${authUser.id}`)
    .maybeSingle()

  if (!userRow) {
    // User exists in auth but has no public.users row (trigger may not have run).
    // Upsert a minimal row so they can proceed to onboarding rather than looping.
    await supabase.from('users').upsert(
      { id: authUser.id, email: authUser.email || null },
      { onConflict: 'id' }
    )
    return null
  }

  // Use userRow.id for linked table queries (may differ from authUser.id for seeded accounts)
  const profileId = userRow.id

  // Build the base profile object — userRow is any so spread is safe
  const base: UserProfile = {
    id:       userRow.id,
    name:     userRow.name || '',
    role:     userRow.role || 'investor',
    email:    userRow.email,
    phone:    userRow.phone,
    city:     userRow.city,
    state:    userRow.state,
    occupation: userRow.occupation,
    username: userRow.username,
    avatar_url: userRow.avatar_url,
    must_change_password: userRow.must_change_password,
    initials:      initialsFor(userRow.name || ''),
    color:         colorFor(userRow.name || ''),
    legal_name:    userRow.legal_name,
    legal_address: userRow.legal_address,
    signature_url: userRow.signature_url,
  }

  let result: UserProfile | null = base

  if (userRow.role === 'investor') {
    const { data: inv } = await supabase
      .from('investors').select('*').eq('user_id', profileId).maybeSingle()
    const range = parseNairaRange(inv?.investment_range || '')
    result = {
      ...base,
      investorId:       inv?.id,
      investmentRange:  inv?.investment_range || '',
      interests:        inv?.interests || [],
      returnStructures: inv?.return_structures || [],
      reportingCadence: inv?.reporting_cadence || [],
      rangeMin:         range.min,
      rangeMax:         range.max,
    }
  } else if (userRow.role === 'business_owner') {
    const { data: biz } = await supabase
      .from('businesses').select('*').eq('owner_id', profileId).maybeSingle()
    const bizAdapted = biz ? adaptBusiness(biz, 0) : {}
    result = {
      ...base,
      ...bizAdapted,
      // Explicitly restore personal fields that adaptBusiness may overwrite
      name:        userRow.name || '',
      initials:    base.initials,
      color:       base.color,
      city:        userRow.city  || undefined,
      state:       userRow.state || undefined,
      avatar_url:  userRow.avatar_url || undefined,
      bizName:     biz?.name,
      businessId:  biz?.id,
      category:    biz?.category    || undefined,
      description: biz?.description || undefined,
      // business-specific numeric fields from adaptBusiness
      askMin:      (bizAdapted as Record<string, unknown>).askMin as number | undefined,
      askMax:      (bizAdapted as Record<string, unknown>).askMax as number | undefined,
      returnStructures:  biz?.return_structures || [],
      reportingCadence:  biz?.reporting_cadence || [],
      legal_biz_name:    biz?.legal_biz_name,
      legal_biz_address: biz?.legal_biz_address,
    }
  }

  _profileCache = result
  return result
}

export async function getMyMatches(): Promise<Business[]> {
  const ids = await getProfileId()
  if (!ids) return []

  const { data: inv } = await supabase
    .from('investors').select('id').eq('user_id', ids.profileId).maybeSingle()
  if (!inv) return []

  const { data: matches } = await supabase
    .from('matches')
    .select(`id, compatibility_score, status,
      businesses (id, name, category, city, state, description, investment_needed,
        use_of_funds, return_structures, reporting_cadence, revenue_range, is_verified, duration, is_visible)`)
    .eq('investor_id', inv.id)
    .in('status', ['pending', 'viewed', 'interested'])
    .order('compatibility_score', { ascending: false })
    .limit(30)

  if (!matches) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (matches as any[])
    .filter(m => m.businesses && m.businesses.is_visible !== false)
    .map(m => adaptBusiness(m.businesses, m.compatibility_score))
}

export async function getBusinessById(bizId: string): Promise<Business | null> {
  const { data: biz } = await supabase
    .from('businesses')
    .select('*, users (id, name, phone, city, state, avatar_url)')
    .eq('id', bizId)
    .maybeSingle()
  if (!biz) return null
  return adaptBusiness(biz, 0)
}

export async function getInvestorById(invId: string): Promise<Investor | null> {
  const { data: inv } = await supabase
    .from('investors')
    .select('*, users (id, name, phone, city, state, occupation, avatar_url)')
    .eq('id', invId)
    .maybeSingle()
  if (!inv) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ...adaptInvestor(inv, (inv as any).users || {}, 0), allowContact: inv.allow_biz_msg !== false }
}

export async function getMyPortfolio(): Promise<Deal[]> {
  const ids = await getProfileId()
  if (!ids) return []

  const { data: inv } = await supabase
    .from('investors').select('id').eq('user_id', ids.profileId).maybeSingle()
  if (!inv) return []

  const { data: matchRows } = await supabase
    .from('matches').select('id').eq('investor_id', inv.id)
  const mids = (matchRows || []).map((m: { id: string }) => m.id)
  if (!mids.length) return []

  const { data: deals } = await supabase
    .from('deals')
    .select(`*, matches (business_id, businesses (id, name, category, city, state))`)
    .in('match_id', mids)
    .in('status', ['active', 'signed', 'proposed'])
    .limit(20)

  if (!deals) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (deals as any[]).map(d => ({
    dealId:     d.id,
    amount:     d.amount,
    status:     d.status,
    returnType: d.return_type,
    biz:        d.matches?.businesses ? adaptBusiness(d.matches.businesses, 0) : null,
    invested:   d.amount,
    paidBack:   0,
    structure:  d.return_type || 'Revenue share',
    monthsIn:   1,
    monthsTotal: 12,
    health:     'good' as const,
    last3:      [1, 1.1, 1.05],
  }))
}

export async function getInterestedInvestors(): Promise<Investor[]> {
  const ids = await getProfileId()
  if (!ids) return []

  const { data: biz } = await supabase
    .from('businesses').select('id').eq('owner_id', ids.profileId).maybeSingle()
  if (!biz) return []

  const { data: matches } = await supabase
    .from('matches')
    .select(`id, compatibility_score, status, created_at,
      investors (id, user_id, investment_range, interests, return_structures, reporting_cadence, is_verified, allow_biz_msg,
        users (id, name, phone, city, state, occupation))`)
    .eq('business_id', biz.id)
    .in('status', ['pending', 'viewed', 'interested', 'negotiating'])
    .order('compatibility_score', { ascending: false })
    .limit(50)

  if (!matches) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (matches as any[]).filter(m => m.investors).map(m => {
    const inv = m.investors
    const u   = inv.users || {}
    return {
      ...adaptInvestor(inv, u, m.compatibility_score),
      allowContact: inv.allow_biz_msg !== false,
      matchId: m.id,
      status:  m.status,
      whenISO: m.created_at,
      offer: {
        amount: parseNairaRange(inv.investment_range).max || 500_000,
        terms:  inv.return_structures?.[0] || 'Revenue share',
      },
    }
  })
}

export async function getNotifications(): Promise<Notification[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return []
  const { data } = await supabase
    .from('notifications').select('*').eq('user_id', authUser.id)
    .order('created_at', { ascending: false }).limit(30)
  return (data as Notification[]) || []
}

export async function markNotificationRead(notifId: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notifId)
}

export async function getReports(dealId: string): Promise<Report[]> {
  const { data } = await supabase
    .from('reports').select('*').eq('deal_id', dealId)
    .order('submitted_at', { ascending: false })
  return (data as Report[]) || []
}

export async function submitReport(payload: {
  dealId: string; businessId: string
  revenue: number; narrative: string; challenges: string
}): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    deal_id:             payload.dealId,
    business_id:         payload.businessId,
    revenue_this_period: payload.revenue,
    narrative:           payload.narrative,
    challenges:          payload.challenges,
    submitted_at:        new Date().toISOString(),
  })
  if (error) throw error
}

export async function updateMatchStatus(matchId: string, status: string): Promise<void> {
  await supabase.from('matches').update({ status }).eq('id', matchId)
}

export async function getOrCreateMatchForBusiness(bizId: string): Promise<string | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null
  const { data: inv } = await supabase.from('investors').select('id').eq('user_id', authUser.id).maybeSingle()
  if (!inv) return null
  // Check for existing row first
  const { data: existing } = await supabase.from('matches').select('id')
    .eq('investor_id', inv.id).eq('business_id', bizId).maybeSingle()
  if (existing) return existing.id
  // Generate UUID client-side so we always know the ID regardless of RLS SELECT restrictions
  const newId = crypto.randomUUID()
  const { error } = await supabase.from('matches')
    .insert({ id: newId, investor_id: inv.id, business_id: bizId, compatibility_score: 0, status: 'interested' })
  if (!error) return newId
  // Insert failed (unique constraint — row already exists from a race). Re-query.
  const { data: retry } = await supabase.from('matches').select('id')
    .eq('investor_id', inv.id).eq('business_id', bizId).maybeSingle()
  return retry?.id || null
}

export async function getOrCreateMatchForInvestor(invId: string): Promise<string | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null
  const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', authUser.id).maybeSingle()
  if (!biz) return null
  const { data: existing } = await supabase.from('matches').select('id')
    .eq('business_id', biz.id).eq('investor_id', invId).maybeSingle()
  if (existing) return existing.id
  const newId = crypto.randomUUID()
  const { error } = await supabase.from('matches')
    .insert({ id: newId, investor_id: invId, business_id: biz.id, compatibility_score: 0, status: 'interested' })
  if (!error) return newId
  const { data: retry } = await supabase.from('matches').select('id')
    .eq('business_id', biz.id).eq('investor_id', invId).maybeSingle()
  return retry?.id || null
}

export async function sendMessage(matchId: string, content: string): Promise<ChatMessage> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: authUser.id, content: content.trim() })
    .select().single()
  if (error) throw error
  return data as ChatMessage
}

export async function getChatMessages(matchId: string): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from('messages').select('*').eq('match_id', matchId)
    .order('created_at', { ascending: true })
  return (data as ChatMessage[]) || []
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  const ext  = file.type.includes('png') ? 'png' : file.type.includes('webp') ? 'webp' : 'jpg'
  const path = `${authUser.id}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
  await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', authUser.id)
  return publicUrl
}

export async function getRecentBusinesses(limit = 3): Promise<Business[]> {
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(b => adaptBusiness(b, 0))
}

export async function getRecentInvestors(limit = 3): Promise<Investor[]> {
  const { data } = await supabase
    .from('investors')
    .select('*, users (id, name, city, state, occupation)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(inv => ({
    ...adaptInvestor(inv, inv.users || {}, 0),
    allowContact: inv.allow_biz_msg !== false,
  }))
}

export async function getMyChats(): Promise<ChatThread[]> {
  const ids = await getProfileId()
  if (!ids) return []

  const { data: userRow } = await supabase.from('users').select('role')
    .or(`id.eq.${ids.authId},auth_uid.eq.${ids.authId}`).maybeSingle()
  const role = userRow?.role

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let matches: any[] = []

  if (role === 'investor') {
    const { data: inv } = await supabase.from('investors').select('id').eq('user_id', ids.profileId).maybeSingle()
    if (!inv) return []
    const { data } = await supabase
      .from('matches')
      .select('id, businesses (id, name)')
      .eq('investor_id', inv.id)
    matches = data || []
  } else {
    const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', ids.profileId).maybeSingle()
    if (!biz) return []
    const { data } = await supabase
      .from('matches')
      .select('id, investors (id, user_id, users (id, name))')
      .eq('business_id', biz.id)
    matches = data || []
  }

  if (matches.length === 0) return []

  const matchIds = matches.map(m => m.id)
  const { data: msgs } = await supabase
    .from('messages')
    .select('match_id, content, created_at, sender_id')
    .in('match_id', matchIds)
    .order('created_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestByMatch = new Map<string, any>()
  for (const msg of msgs || []) {
    if (!latestByMatch.has(msg.match_id)) latestByMatch.set(msg.match_id, msg)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return matches
    .filter(m => latestByMatch.has(m.id))
    .map(m => {
      const lastMsg = latestByMatch.get(m.id)
      let name = 'Unknown'
      if (role === 'investor') {
        name = (m.businesses as { name?: string })?.name || 'Business'
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = (m.investors as any)?.users
        name = u?.name || 'Investor'
      }
      return {
        matchId:              m.id,
        counterparty:         name,
        counterpartyInitials: initialsFor(name),
        counterpartyColor:    colorFor(name),
        lastMessage:          lastMsg?.content || '',
        lastMessageTime:      lastMsg?.created_at || '',
        isMine:               lastMsg?.sender_id === ids.authId,
      }
    })
    .sort((a, b) => b.lastMessageTime.localeCompare(a.lastMessageTime))
}

export async function getMatchCounterpartyName(matchId: string, role: 'investor' | 'business_owner'): Promise<string> {
  if (role === 'investor') {
    const { data } = await supabase
      .from('matches').select('businesses (name)').eq('id', matchId).maybeSingle()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any)?.businesses?.name || 'Business'
  } else {
    const { data } = await supabase
      .from('matches').select('investors (users (name))').eq('id', matchId).maybeSingle()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any)?.investors?.users?.name || 'Investor'
  }
}

// ── Offers ────────────────────────────────────────────────────────────────────

export interface OfferTerms {
  amount: number
  is_milestoned: boolean
  milestones?: { amount: number; description: string }[]
  return_type: 'fixed' | 'revenue_share' | 'equity'
  reporting_frequency: 'weekly' | 'monthly' | 'quarterly'
  roi_percent?: number
  total_return_amount?: number
  repayment_method?: 'monthly_payment' | 'end_date'
  monthly_payment?: number
  end_date?: string
  revenue_percent?: number
  equity_percent?: number
  has_voting_rights?: boolean
  notes?: string
  is_template?: boolean
  template_name?: string
  parent_offer_id?: string
}

export async function saveOffer(matchId: string, terms: OfferTerms): Promise<string> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  const id = crypto.randomUUID()
  const { error } = await supabase.from('offers').insert({
    id,
    match_id:            matchId,
    proposer_id:         authUser.id,
    amount:              terms.amount,
    return_type:         terms.return_type,
    return_rate:         terms.roi_percent,
    duration_months:     terms.repayment_method === 'end_date' ? null : null,
    notes:               terms.notes,
    status:              terms.is_template ? 'template' : 'pending',
    is_milestoned:       terms.is_milestoned,
    milestones:          terms.milestones || null,
    monthly_payment:     terms.monthly_payment,
    end_date:            terms.end_date,
    revenue_percent:     terms.revenue_percent,
    equity_percent:      terms.equity_percent,
    has_voting_rights:   terms.has_voting_rights,
    reporting_frequency: terms.reporting_frequency,
    total_return_amount: terms.total_return_amount,
    is_template:         terms.is_template || false,
    template_name:       terms.template_name,
    parent_offer_id:     terms.parent_offer_id,
  })
  if (error) throw error

  // Create a chat message so the offer appears in the conversation
  if (!terms.is_template) {
    const amtStr = terms.amount ? `₦${Number(terms.amount).toLocaleString('en-NG')}` : ''
    // Use server API to bypass RLS (seeded users have profile id ≠ auth uid)
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id:     matchId,
        sender_id:    authUser.id,
        content:      `💰 Offer${amtStr ? `: ${amtStr}` : ''}`,
        content_type: 'offer',
        ref_id:       id,
      }),
    }).catch(() => {/* non-fatal */})
  }

  return id
}

export async function getOffersForMatch(matchId: string): Promise<(OfferTerms & { id: string; status: string; proposer_id: string; created_at: string })[]> {
  const { data } = await supabase
    .from('offers').select('*').eq('match_id', matchId).neq('status', 'template')
    .order('created_at', { ascending: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]) || []
}

export async function getOfferTemplates(): Promise<(OfferTerms & { id: string; template_name: string })[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return []
  const { data } = await supabase
    .from('offers').select('*').eq('proposer_id', authUser.id).eq('is_template', true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]) || []
}

export async function updateOfferStatus(offerId: string, status: string): Promise<void> {
  await supabase.from('offers').update({ status }).eq('id', offerId)
}

export async function acceptOffer(offerId: string, matchId: string): Promise<void> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  const { error } = await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId)
  if (error) throw error
  await supabase.from('messages').insert({
    id:           crypto.randomUUID(),
    match_id:     matchId,
    sender_id:    authUser.id,
    content:      '✅ Offer accepted',
    content_type: 'offer_accepted',
    ref_id:       offerId,
  })
}

export async function sendCounterOffer(
  originalOfferId: string,
  matchId: string,
  terms: OfferTerms,
): Promise<string> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  // Mark the original as countered
  await supabase.from('offers').update({ status: 'countered' }).eq('id', originalOfferId)
  // Create the counter offer
  const id = crypto.randomUUID()
  const { error } = await supabase.from('offers').insert({
    id,
    match_id:            matchId,
    proposer_id:         authUser.id,
    parent_offer_id:     originalOfferId,
    amount:              terms.amount,
    return_type:         terms.return_type,
    return_rate:         terms.roi_percent,
    notes:               terms.notes,
    status:              'pending',
    is_milestoned:       terms.is_milestoned,
    milestones:          terms.milestones || null,
    monthly_payment:     terms.monthly_payment,
    end_date:            terms.end_date,
    revenue_percent:     terms.revenue_percent,
    equity_percent:      terms.equity_percent,
    has_voting_rights:   terms.has_voting_rights,
    reporting_frequency: terms.reporting_frequency,
    total_return_amount: terms.total_return_amount,
    is_template:         false,
  })
  if (error) throw error
  const amtStr = terms.amount ? `₦${Number(terms.amount).toLocaleString('en-NG')}` : ''
  await supabase.from('messages').insert({
    id:           crypto.randomUUID(),
    match_id:     matchId,
    sender_id:    authUser.id,
    content:      `⚡️ Counter offer${amtStr ? `: ${amtStr}` : ''}`,
    content_type: 'offer',
    ref_id:       id,
  })
  return id
}

export interface InvestorOffer {
  id: string
  match_id: string
  proposer_id: string
  amount: number
  return_type: string
  status: string
  created_at: string
  is_template?: boolean
  template_name?: string
  roi_percent?: number
  revenue_percent?: number
  equity_percent?: number
  total_return_amount?: number
  monthly_payment?: number
  end_date?: string
  reporting_frequency?: string
  is_milestoned?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  milestones?: any[]
  has_voting_rights?: boolean
  notes?: string
  biz_name?: string
  biz_initials?: string
  biz_color?: string
  is_mine?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOffer(o: any, myId: string): InvestorOffer {
  const bizName = o.matches?.businesses?.name
  return {
    id:                  o.id,
    match_id:            o.match_id,
    proposer_id:         o.proposer_id,
    amount:              o.amount,
    return_type:         o.return_type,
    status:              o.status,
    created_at:          o.created_at,
    is_template:         o.is_template,
    template_name:       o.template_name,
    roi_percent:         o.return_rate ?? o.roi_percent,
    revenue_percent:     o.revenue_percent,
    equity_percent:      o.equity_percent,
    total_return_amount: o.total_return_amount,
    monthly_payment:     o.monthly_payment,
    end_date:            o.end_date,
    reporting_frequency: o.reporting_frequency,
    is_milestoned:       o.is_milestoned,
    milestones:          o.milestones,
    has_voting_rights:   o.has_voting_rights,
    notes:               o.notes,
    biz_name:            bizName,
    biz_initials:        bizName ? initialsFor(bizName) : undefined,
    biz_color:           bizName ? colorFor(bizName)    : undefined,
    is_mine:             o.proposer_id === myId,
  }
}

const OFFER_SELECT = `
  id, match_id, proposer_id, amount, return_type, status, created_at,
  is_template, template_name, return_rate, revenue_percent, equity_percent,
  total_return_amount, monthly_payment, end_date, reporting_frequency,
  is_milestoned, milestones, has_voting_rights, notes,
  matches(businesses(name))
`

export async function getMyOffers(): Promise<InvestorOffer[]> {
  const ids = await getProfileId()
  if (!ids) return []

  // Get investor record to find all match IDs
  const { data: inv } = await supabase
    .from('investors').select('id').eq('user_id', ids.profileId).maybeSingle()

  let matchIds: string[] = []
  if (inv) {
    const { data: matchRows } = await supabase
      .from('matches').select('id').eq('investor_id', inv.id)
    matchIds = (matchRows || []).map((m: { id: string }) => m.id)
  }

  if (matchIds.length > 0) {
    // Fetch all offers (sent + received) for those matches, excluding templates
    const { data } = await supabase
      .from('offers')
      .select(OFFER_SELECT)
      .in('match_id', matchIds)
      .eq('is_template', false)
      .order('created_at', { ascending: false })
    if (data?.length) return (data as any[]).map(o => mapOffer(o, ids.authId))  // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  // Fallback: get offers proposed by this user (covers cases where investor record lookup fails)
  const { data: fallback } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('proposer_id', ids.authId)
    .eq('is_template', false)
    .order('created_at', { ascending: false })
  if (!fallback) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (fallback as any[]).map(o => mapOffer(o, ids.authId))
}

export async function getMyTemplates(): Promise<InvestorOffer[]> {
  const ids = await getProfileId()
  if (!ids) return []
  const { data } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('proposer_id', ids.authId)
    .eq('is_template', true)
    .order('created_at', { ascending: false })
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(o => mapOffer(o, ids.authId))
}

// ── Issue Reports ─────────────────────────────────────────────────────────────

export async function submitIssueReport(matchId: string, category: string, description: string): Promise<void> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  const { error } = await supabase.from('issue_reports').insert({
    match_id:    matchId,
    reporter_id: authUser.id,
    category,
    description,
  })
  if (error) throw error
}

// ── Business Documents / Links ────────────────────────────────────────────────

export interface BusinessDocument {
  id: string
  business_id: string
  uploader_id: string
  doc_type: string
  item_type: 'file' | 'link'
  file_name: string
  file_url: string
  storage_path?: string
  file_size?: number
  link_title?: string
  is_verified: boolean
  uploaded_at: string
}

export async function getBusinessDocumentsForMatch(matchId: string): Promise<BusinessDocument[]> {
  // Get the business_id from the match
  const { data: match } = await supabase.from('matches').select('business_id').eq('id', matchId).maybeSingle()
  if (!match?.business_id) return []
  const { data } = await supabase
    .from('business_documents').select('*').eq('business_id', match.business_id)
    .order('uploaded_at', { ascending: false })
  return (data as BusinessDocument[]) || []
}

export async function getMyBusinessDocuments(): Promise<BusinessDocument[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return []
  const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', authUser.id).maybeSingle()
  if (!biz) return []
  const { data } = await supabase
    .from('business_documents').select('*').eq('business_id', biz.id)
    .order('uploaded_at', { ascending: false })
  return (data as BusinessDocument[]) || []
}

export async function uploadBusinessFile(file: File, docType: string): Promise<BusinessDocument> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  const { data: biz } = await supabase.from('businesses').select('id, name').eq('owner_id', authUser.id).maybeSingle()
  if (!biz) throw new Error('No business found')

  const bucket  = docType === 'photo' ? 'business-photos' : docType === 'bank_statement' ? 'deal-files' : 'documents'
  const ext     = file.name.split('.').pop() || 'bin'
  const path    = `${biz.id}/${docType}/${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type })
  if (upErr) throw upErr
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)

  const id = crypto.randomUUID()
  const { error } = await supabase.from('business_documents').insert({
    id,
    business_id:  biz.id,
    uploader_id:  authUser.id,
    doc_type:     docType,
    item_type:    'file',
    file_name:    file.name,
    file_url:     publicUrl,
    storage_path: path,
    file_size:    file.size,
    uploaded_at:  new Date().toISOString(),
  })
  if (error) throw error
  return { id, business_id: biz.id, uploader_id: authUser.id, doc_type: docType, item_type: 'file',
    file_name: file.name, file_url: publicUrl, storage_path: path, file_size: file.size,
    is_verified: false, uploaded_at: new Date().toISOString() }
}

export async function uploadBusinessBanner(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle()
  if (!biz) throw new Error('No business found')
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${biz.id}/banner.${ext}`
  const { error: upErr } = await supabase.storage.from('business-photos').upload(path, file, { upsert: true, contentType: file.type })
  if (upErr) throw upErr
  const { data: { publicUrl } } = supabase.storage.from('business-photos').getPublicUrl(path)
  await supabase.from('businesses').update({ banner_url: publicUrl }).eq('id', biz.id)
  return publicUrl
}

export async function addBusinessLink(url: string, title: string, docType: string): Promise<BusinessDocument> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', authUser.id).maybeSingle()
  if (!biz) throw new Error('No business found')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('business_documents').insert({
    id,
    business_id:  biz.id,
    uploader_id:  authUser.id,
    doc_type:     docType,
    item_type:    'link',
    file_name:    title,
    file_url:     url,
    storage_path: '',
    link_title:   title,
    uploaded_at:  new Date().toISOString(),
  })
  if (error) throw error
  return { id, business_id: biz.id, uploader_id: authUser.id, doc_type: docType, item_type: 'link',
    file_name: title, file_url: url, link_title: title, is_verified: false, uploaded_at: new Date().toISOString() }
}

export async function deleteBusinessDocument(docId: string): Promise<void> {
  await supabase.from('business_documents').delete().eq('id', docId)
}

// ─── Contract readiness check ────────────────────────────────────────────────

export async function checkBizContractReadiness(): Promise<{ ready: boolean; missing: string[] }> {
  const ids = await getProfileId()
  if (!ids) return { ready: false, missing: ['Not authenticated'] }
  const [{ data: user }, { data: biz }] = await Promise.all([
    supabase.from('users').select('legal_name, signature_url')
      .or(`id.eq.${ids.authId},auth_uid.eq.${ids.authId}`).maybeSingle(),
    supabase.from('businesses').select('legal_biz_name, account_number')
      .eq('owner_id', ids.profileId).maybeSingle(),
  ])
  const missing: string[] = []
  if (!user?.legal_name?.trim())    missing.push('your legal name')
  if (!biz?.legal_biz_name?.trim()) missing.push('business legal name')
  if (!biz?.account_number?.trim()) missing.push('bank account details')
  if (!user?.signature_url)         missing.push('your signature')
  return { ready: missing.length === 0, missing }
}

// ─── Default contract HTML ────────────────────────────────────────────────────

const DEFAULT_CONTRACT_HTML = `<div style="font-family:Georgia,serif;max-width:700px;margin:0 auto;padding:40px;line-height:1.8;color:#111">
<h1 style="text-align:center;font-size:22px;margin-bottom:4px">Investment Agreement</h1>
<p style="text-align:center;color:#6b7280;font-size:13px;margin-bottom:36px">{{date}}</p>
<p>This Investment Agreement is entered into as of <strong>{{date}}</strong> between:</p>
<p><strong>Investor:</strong> {{investor_legal_name}}<br><span style="color:#6b7280">{{investor_address}}</span></p>
<p><strong>Business:</strong> {{legal_biz_name}}, represented by {{owner_name}}<br><span style="color:#6b7280">{{biz_address}}</span></p>
<h2 style="margin-top:28px;font-size:16px;border-bottom:1px solid #e5e7eb;padding-bottom:6px">Investment Terms</h2>
<ul style="padding-left:20px">
  <li>Investment amount: <strong>{{amount}}</strong></li>
  <li>Return structure: <strong>{{return_type}}</strong></li>
  <li>Expected total return: <strong>{{total_return_amount}}</strong></li>
  <li>ROI: <strong>{{roi_percent}}</strong></li>
  <li>Reporting frequency: <strong>{{reporting_frequency}}</strong></li>
</ul>
{{notes_section}}
<h2 style="margin-top:36px;font-size:16px;border-bottom:1px solid #e5e7eb;padding-bottom:6px">Signatures</h2>
<div style="display:flex;gap:60px;margin-top:24px;flex-wrap:wrap">
  <div style="min-width:200px">
    <div style="font-size:12px;color:#9ca3af;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Business Owner</div>
    {{biz_signature}}
    <div style="border-top:1px solid #d1d5db;margin-top:10px;padding-top:6px;font-size:13px">{{owner_name}} · {{biz_signed_date}}</div>
  </div>
  <div style="min-width:200px">
    <div style="font-size:12px;color:#9ca3af;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Investor</div>
    {{inv_signature}}
    <div style="border-top:1px solid #d1d5db;margin-top:10px;padding-top:6px;font-size:13px">{{investor_legal_name}} · {{inv_signed_date}}</div>
  </div>
</div>
</div>`

function fillContract(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? '')
}

// ─── Accept offer + create deal + create contract ─────────────────────────────

export async function acceptOfferWithContract(
  offerId: string,
  matchId: string,
  bizSigBase64: string,
): Promise<{ dealId: string; contractId: string }> {
  const ids = await getProfileId()
  if (!ids) throw new Error('Not authenticated')

  const { data: offer } = await supabase
    .from('offers')
    .select(`*, matches(
      businesses(name, legal_biz_name, legal_biz_address),
      investors(users(name, legal_name, legal_address))
    )`)
    .eq('id', offerId).maybeSingle()
  if (!offer) throw new Error('Offer not found')

  const { data: bizUser } = await supabase.from('users').select('name, legal_name')
    .or(`id.eq.${ids.authId},auth_uid.eq.${ids.authId}`).maybeSingle()

  const { data: templates } = await supabase.from('contract_templates')
    .select('id, body_html, category').eq('is_active', true).limit(10)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tpl = (templates as any[] || []).find((t: any) => t.category === offer.return_type)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    || (templates as any[] || [])[0]

  const today = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invUser = (offer.matches as any)?.investors?.users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const biz     = (offer.matches as any)?.businesses

  const bizSigHtml = bizSigBase64
    ? `<img src="${bizSigBase64}" style="height:60px;max-width:220px;display:block" />`
    : '<span style="color:#6b7280">[Signed]</span>'

  const vars: Record<string, string> = {
    investor_name:       invUser?.name          || 'Investor',
    investor_legal_name: invUser?.legal_name    || invUser?.name || 'Investor',
    investor_address:    invUser?.legal_address || '',
    business_name:       biz?.name              || 'Business',
    legal_biz_name:      biz?.legal_biz_name    || biz?.name || 'Business',
    biz_address:         biz?.legal_biz_address || '',
    owner_name:          bizUser?.legal_name    || bizUser?.name || '',
    amount:              offer.amount != null ? `₦${Number(offer.amount).toLocaleString('en-NG')}` : '',
    return_type:         ({ fixed: 'Fixed Returns', revenue_share: 'Revenue Share', equity: 'Equity' } as Record<string,string>)[offer.return_type as string] || offer.return_type || '',
    roi_percent:         offer.return_rate         != null ? `${offer.return_rate}%`         : '',
    total_return_amount: offer.total_return_amount != null ? `₦${Number(offer.total_return_amount).toLocaleString('en-NG')}` : '',
    revenue_percent:     offer.revenue_percent     != null ? `${offer.revenue_percent}%`     : '',
    equity_percent:      offer.equity_percent      != null ? `${offer.equity_percent}%`      : '',
    reporting_frequency: offer.reporting_frequency || '',
    notes:               offer.notes || '',
    notes_section:       offer.notes ? `<h2 style="margin-top:28px;font-size:16px">Additional Notes</h2><p>${offer.notes}</p>` : '',
    date:                today,
    biz_signature:       bizSigHtml,
    biz_signed_date:     today,
    inv_signature:       '<span id="inv-sig-placeholder" style="color:#d1d5db;font-style:italic;font-size:13px">[Awaiting investor signature]</span>',
    inv_signed_date:     '',
  }

  const filledHtml = fillContract(tpl?.body_html || DEFAULT_CONTRACT_HTML, vars)

  const dealId = crypto.randomUUID()
  const { error: dealErr } = await supabase.from('deals').insert({
    id: dealId, match_id: matchId,
    amount: offer.amount, return_type: offer.return_type, status: 'proposed',
  })
  if (dealErr) throw dealErr

  const contractId = crypto.randomUUID()
  const { error: cErr } = await supabase.from('signed_contracts').insert({
    id: contractId, deal_id: dealId,
    template_id: tpl?.id || null,
    body_html: filledHtml,
    biz_signed_at: new Date().toISOString(),
  })
  if (cErr) throw cErr

  await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId)

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (authUser) {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: matchId, sender_id: authUser.id,
        content: '✅ Offer accepted',
        content_type: 'offer_accepted', ref_id: offerId,
      }),
    }).catch(() => {/* non-fatal */})
  }

  return { dealId, contractId }
}

// ─── Get deal + contract for offer ───────────────────────────────────────────

export async function getDealForOffer(offerId: string): Promise<{
  dealId: string; dealStatus: string;
  contractId: string | null; bizSignedAt: string | null;
  invSignedAt: string | null; paymentConfirmedAt: string | null;
} | null> {
  const { data: offer } = await supabase.from('offers').select('match_id').eq('id', offerId).maybeSingle()
  if (!offer?.match_id) return null
  const { data: deal } = await supabase.from('deals').select('id, status')
    .eq('match_id', offer.match_id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!deal) return null
  const { data: contract } = await supabase.from('signed_contracts')
    .select('id, biz_signed_at, inv_signed_at, payment_confirmed_at').eq('deal_id', deal.id).maybeSingle()
  return {
    dealId: deal.id, dealStatus: deal.status,
    contractId: contract?.id || null,
    bizSignedAt: contract?.biz_signed_at || null,
    invSignedAt: contract?.inv_signed_at || null,
    paymentConfirmedAt: contract?.payment_confirmed_at || null,
  }
}

// ─── Get contract HTML ────────────────────────────────────────────────────────

export async function getContractHtml(contractId: string): Promise<string | null> {
  const { data } = await supabase.from('signed_contracts').select('body_html').eq('id', contractId).maybeSingle()
  return data?.body_html || null
}

// ─── Investor sign contract ───────────────────────────────────────────────────

export async function investorSignContract(contractId: string, sigBase64: string, dealId: string): Promise<void> {
  const { data: contract } = await supabase.from('signed_contracts').select('body_html').eq('id', contractId).maybeSingle()
  if (!contract) throw new Error('Contract not found')

  const { data: { user } } = await supabase.auth.getUser()
  const { data: u } = user ? await supabase.from('users').select('legal_name, name')
    .or(`id.eq.${user.id},auth_uid.eq.${user.id}`).maybeSingle() : { data: null }
  const invName = u?.legal_name || u?.name || 'Investor'
  const today = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })

  const sigHtml = `<img src="${sigBase64}" style="height:60px;max-width:220px;display:block" />`
  const updatedHtml = contract.body_html
    .replace('<span id="inv-sig-placeholder" style="color:#d1d5db;font-style:italic;font-size:13px">[Awaiting investor signature]</span>', sigHtml)
    .replace('{{inv_signed_date}}', today)
    .replace(invName + ' · ', invName + ' · ')

  await supabase.from('signed_contracts').update({
    inv_signed_at: new Date().toISOString(),
    inv_signature_url: 'base64_embedded',
    body_html: updatedHtml,
  }).eq('id', contractId)

  await supabase.from('deals').update({ status: 'signed' }).eq('id', dealId)
}