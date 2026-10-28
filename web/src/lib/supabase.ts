import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/db'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fail loudly at startup instead of with confusing network errors later.
// Developer-facing message, so it is not translated.
if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY (see web/.env.example)')
}

// Only the publishable/anon key belongs here: everything it can do is limited by RLS.
export const supabase = createClient<Database>(url, anonKey)

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type UserRole = Database['public']['Enums']['user_role']
