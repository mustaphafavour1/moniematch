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
  }
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<UserProfile | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: userRow } = await supabase
    .from('users').select('*').eq('id', authUser.id).maybeSingle()

  if (!userRow) return null

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
    return {
      ...base,
      ...(biz ? adaptBusiness(biz, 0) : {}),
      bizName:     biz?.name,
      businessId:  biz?.id,
      category:    biz?.category  || undefined,
      description: biz?.description || undefined,
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