// ── Adapted UI shapes (output of db.ts adapters) ──────────────────────────────

export interface Business {
  id: string
  business: string
  category: string
  city: string
  state: string
  use: string
  description: string
  revenue: string
  returnHeadline: string
  returnStructures: string[]
  reportingCadence: string[]
  askMin: number
  askMax: number
  matchScore: number
  color: string
  initials: string
  photoLab: string
  raised: number
  target: number
  isVerified: boolean
  duration: string
  ownerId: string
  ownerName?: string
  ownerPhone?: string
  // extra fields used in detail view
  pitch?: string
  name?: string       // owner name alias
  cadence?: string[]
  risk?: string
  seasonality?: string
  yearsRunning?: number
  employees?: number
  monthlyRevenue?: { min: number; max: number }
  tags?: string[]
}

export interface Investor {
  id: string
  userId: string
  name: string
  role: string
  city: string
  state: string
  interests: string[]
  investmentRange: string
  returnStructures: string[]
  reportingCadence: string[]
  matchScore: number
  initials: string
  color: string
  isVerified: boolean
  // with match context
  matchId?: string
  status?: string
  whenISO?: string
  offer?: { amount: number; terms: string }
}

export interface UserProfile {
  id: string
  name: string
  role: 'investor' | 'business_owner'
  email?: string
  city?: string
  state?: string
  occupation?: string
  username?: string
  avatar_url?: string
  must_change_password?: boolean
  // investor fields
  investorId?: string
  investmentRange?: string
  interests?: string[]
  returnStructures?: string[]
  reportingCadence?: string[]
  // business owner fields
  bizName?: string
  businessId?: string
  category?: string
  description?: string
  // computed
  initials: string
  color: string
  // prefs helpers
  rangeMin?: number
  rangeMax?: number
  returnGoal?: string
}

export interface Deal {
  dealId: string
  amount: number
  status: 'proposed' | 'signed' | 'active' | 'completed' | 'defaulted'
  returnType: string | null
  biz: Business | null
  // portfolio display
  invested?: number
  paidBack?: number
  structure?: string
  monthsIn?: number
  monthsTotal?: number
  health?: 'good' | 'watch'
  last3?: number[]
  nextPayoutAmount?: number
  nextPayoutDate?: string
  flag?: string
  businessId?: string
}

export interface Report {
  id: string
  deal_id: string
  business_id: string
  revenue_this_period: number | null
  narrative: string | null
  challenges: string | null
  submitted_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string | null
  body: string | null
  is_read: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
}