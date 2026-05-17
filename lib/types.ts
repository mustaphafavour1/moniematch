// ── Landing page types ────────────────────────────────────────────────────────

export interface NavLink {
  label: string
  href: string
}

export interface FeatureCard {
  num: string
  title: string
  description: string
  visual: 'score' | 'pills-verified' | 'chat' | 'report' | 'portfolio' | 'pills-return'
}

export interface ProblemPair {
  flip?: boolean
  left: {
    icon: string
    tag: string
    title: string
    desc: string
  }
  right: {
    icon: string
    tag: string
    title: string
    desc: string
  }
}

export interface HowItWorksStep {
  num: string
  icon: string
  title: string
  desc: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface AlgoRow {
  icon: string
  label: string
  pct: number
  points: number
}

// ── App types (investor + business screens) ───────────────────────────────────

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
  cadence?: string[]
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
  ownerAvatar?: string
  name?: string
  pitch?: string
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
  avatar_url?: string
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
  phone?: string
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
  rangeMin?: number
  rangeMax?: number
  returnGoal?: string
  // business owner fields
  bizName?: string
  businessId?: string
  category?: string
  description?: string
  askMin?: number
  askMax?: number
  // computed
  initials: string
  color: string
  // contract / legal fields
  legal_name?: string
  legal_address?: string
  legal_biz_name?: string
  legal_biz_address?: string
  signature_url?: string
}

export interface Deal {
  dealId: string
  amount: number
  status: 'proposed' | 'signed' | 'active' | 'completed' | 'defaulted'
  returnType: string | null
  biz: Business | null
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
  content_type?: string
  ref_id?: string
  created_at: string
}

export interface ChatThread {
  matchId: string
  counterparty: string
  counterpartyInitials: string
  counterpartyColor: string
  lastMessage: string
  lastMessageTime: string
  isMine: boolean
}