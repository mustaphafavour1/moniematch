import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const SUPABASE_URL      = 'https://qswevhaeizzhpviwlccm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzd2V2aGFlaXp6aHB2aXdsY2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjMxMTAsImV4cCI6MjA5NDA5OTExMH0.Ktaa7Xz1J5282k3YPu_dd-drM669emZx6k7WzXt15gE'

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
