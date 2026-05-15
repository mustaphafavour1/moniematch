// Auto-generated types would normally come from `supabase gen types typescript`
// These are hand-authored from the db.jsx query shapes

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          name: string | null
          username: string | null
          role: 'investor' | 'business_owner' | null
          city: string | null
          state: string | null
          occupation: string | null
          phone: string | null
          avatar_url: string | null
          must_change_password: boolean | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      investors: {
        Row: {
          id: string
          user_id: string
          investment_range: string | null
          interests: string[] | null
          return_structures: string[] | null
          reporting_cadence: string[] | null
          is_verified: boolean | null
          city: string | null
          state: string | null
          compatibility_score: number | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['investors']['Row']>
        Update: Partial<Database['public']['Tables']['investors']['Row']>
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          category: string | null
          city: string | null
          state: string | null
          description: string | null
          use_of_funds: string | null
          investment_needed: string | null
          return_structures: string[] | null
          reporting_cadence: string[] | null
          revenue_range: string | null
          is_verified: boolean | null
          duration: string | null
          raised: number | null
          compatibility_score: number | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['businesses']['Row']>
        Update: Partial<Database['public']['Tables']['businesses']['Row']>
      }
      matches: {
        Row: {
          id: string
          investor_id: string
          business_id: string
          compatibility_score: number
          status: 'pending' | 'viewed' | 'interested' | 'negotiating' | 'declined'
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['matches']['Row']>
        Update: Partial<Database['public']['Tables']['matches']['Row']>
      }
      deals: {
        Row: {
          id: string
          match_id: string | null
          investor_id: string
          business_id: string
          amount: number
          status: 'proposed' | 'signed' | 'active' | 'completed' | 'defaulted'
          return_type: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['deals']['Row']>
        Update: Partial<Database['public']['Tables']['deals']['Row']>
      }
      reports: {
        Row: {
          id: string
          deal_id: string
          business_id: string
          revenue_this_period: number | null
          narrative: string | null
          challenges: string | null
          submitted_at: string
        }
        Insert: Partial<Database['public']['Tables']['reports']['Row']>
        Update: Partial<Database['public']['Tables']['reports']['Row']>
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['messages']['Row']>
        Update: Partial<Database['public']['Tables']['messages']['Row']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string | null
          body: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['notifications']['Row']>
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
    }
  }
}
