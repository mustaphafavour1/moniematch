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

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<UserProfile | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: userRow } = await supabase
    .from('users').select('*').eq('id', authUser.id).maybeSingle()

  if (!userRow) {
    // User exists in auth but has no public.users row (trigger may not have run).
    // Upsert a minimal row so they can proceed to onboarding rather than looping.
    await supabase.from('users').upsert(
      { id: authUser.id, email: authUser.email || null },
      { onConflict: 'id' }
    )
    return null
  }

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
    initials: initialsFor(userRow.name || ''),
    color:    colorFor(userRow.name || ''),
  }

  if (userRow.role === 'investor') {
    const { data: inv } = await supabase
      .from('investors').select('*').eq('user_id', authUser.id).maybeSingle()
    const range = parseNairaRange(inv?.investment_range || '')
    return {
      ...base,
      investorId:       inv?.id,
      investmentRange:  inv?.investment_range || '',
      interests:        inv?.interests || [],
      returnStructures: inv?.return_structures || [],
      reportingCadence: inv?.reporting_cadence || [],
      rangeMin:         range.min,
      rangeMax:         range.max,
    }
  }

  if (userRow.role === 'business_owner') {
    const { data: biz } = await supabase
      .from('businesses').select('*').eq('owner_id', authUser.id).maybeSingle()
    const bizAdapted = biz ? adaptBusiness(biz, 0) : {}
    return {
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
      returnStructures: biz?.return_structures || [],
      reportingCadence: biz?.reporting_cadence || [],
    }
  }

  return base
}

export async function getMyMatches(): Promise<Business[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return []

  const { data: inv } = await supabase
    .from('investors').select('id').eq('user_id', authUser.id).maybeSingle()
  if (!inv) return []

  const { data: matches } = await supabase
    .from('matches')
    .select(`id, compatibility_score, status,
      businesses (id, name, category, city, state, description, investment_needed,
        use_of_funds, return_structures, reporting_cadence, revenue_range, is_verified, duration)`)
    .eq('investor_id', inv.id)
    .in('status', ['pending', 'viewed', 'interested'])
    .order('compatibility_score', { ascending: false })
    .limit(30)

  if (!matches) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (matches as any[]).filter(m => m.businesses).map(m => adaptBusiness(m.businesses, m.compatibility_score))
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
  return adaptInvestor(inv, (inv as any).users || {}, 0)
}

export async function getMyPortfolio(): Promise<Deal[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return []

  const { data: inv } = await supabase
    .from('investors').select('id').eq('user_id', authUser.id).maybeSingle()
  if (!inv) return []

  const { data: deals } = await supabase
    .from('deals')
    .select(`*, matches (business_id, businesses (id, name, category, city, state))`)
    .eq('investor_id', inv.id)
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
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return []

  const { data: biz } = await supabase
    .from('businesses').select('id').eq('owner_id', authUser.id).maybeSingle()
  if (!biz) return []

  const { data: matches } = await supabase
    .from('matches')
    .select(`id, compatibility_score, status, created_at,
      investors (id, user_id, investment_range, interests, return_structures, reporting_cadence, is_verified,
        users (id, name, phone, city, state, occupation))`)
    .eq('business_id', biz.id)
    .in('status', ['pending', 'viewed', 'interested', 'negotiating'])
    .order('compatibility_score', { ascending: false })
    .limit(20)

  if (!matches) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (matches as any[]).filter(m => m.investors).map(m => {
    const inv = m.investors
    const u   = inv.users || {}
    return {
      ...adaptInvestor(inv, u, m.compatibility_score),
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
  return (data as any[]).map(inv => adaptInvestor(inv, inv.users || {}, 0))
}

export async function getMyChats(): Promise<ChatThread[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return []

  const { data: userRow } = await supabase.from('users').select('role').eq('id', authUser.id).maybeSingle()
  const role = userRow?.role

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let matches: any[] = []

  if (role === 'investor') {
    const { data: inv } = await supabase.from('investors').select('id').eq('user_id', authUser.id).maybeSingle()
    if (!inv) return []
    const { data } = await supabase
      .from('matches')
      .select('id, businesses (id, name)')
      .eq('investor_id', inv.id)
    matches = data || []
  } else {
    const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', authUser.id).maybeSingle()
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
        isMine:               lastMsg?.sender_id === authUser.id,
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
  const path    = `${biz.name}/${docType}/${Date.now()}.${ext}`
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

export async function addBusinessLink(url: string, title: string, docType: string): Promise<BusinessDocument> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) throw new Error('Not authenticated')
  const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', authUser.id).maybeSingle()
  if (!biz) throw new Error('No business found')

  const id = crypto.randomUUID()
  const { error } = await supabase.from('business_documents').insert({
    id,
    business_id: biz.id,
    uploader_id: authUser.id,
    doc_type:    docType,
    item_type:   'link',
    file_name:   title,
    file_url:    url,
    link_title:  title,
    uploaded_at: new Date().toISOString(),
  })
  if (error) throw error
  return { id, business_id: biz.id, uploader_id: authUser.id, doc_type: docType, item_type: 'link',
    file_name: title, file_url: url, link_title: title, is_verified: false, uploaded_at: new Date().toISOString() }
}

export async function deleteBusinessDocument(docId: string): Promise<void> {
  await supabase.from('business_documents').delete().eq('id', docId)
}