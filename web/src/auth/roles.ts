import type { UserRole } from '../lib/supabase'

export type Area = 'athlete' | 'coach'

// Admins use the coach area: private.is_coach() treats 'admin' as a coach too.
export function areaForRole(role: UserRole): Area {
  return role === 'athlete' ? 'athlete' : 'coach'
}

export function homePathForRole(role: UserRole): string {
  return `/${areaForRole(role)}`
}
