import type { Session } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

export type AuthState = { session: Session | null; loading: boolean }

export const AuthContext = createContext<AuthState>({ session: null, loading: true })

export function useAuth(): AuthState {
  return useContext(AuthContext)
}

// The role is read from public.profiles (protected by RLS and column grants),
// never from the JWT's user_metadata, which the user can edit.
export function useProfile() {
  const { session } = useAuth()
  const userId = session?.user.id

  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, locale, full_name')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data
    },
  })
}
