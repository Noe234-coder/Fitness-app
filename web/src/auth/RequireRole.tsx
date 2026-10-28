import { type ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router'
import { FullScreenMessage } from '../components/FullScreenMessage'
import i18n, { changeLocale } from '../i18n'
import { isLocale } from '../i18n/locale'
import { supabase } from '../lib/supabase'
import { useAuth, useProfile } from './useAuth'
import { type Area, areaForRole, homePathForRole } from './roles'

// UX only: it decides which screen to show. What data a user can actually read
// or write is enforced by RLS in the database, so forcing a URL gains nothing.
export function RequireRole({ area, children }: { area: Area; children: ReactNode }) {
  const { session, loading } = useAuth()
  const profile = useProfile()
  const locale = profile.data?.locale

  // After login, the language saved in the profile wins over the device default.
  useEffect(() => {
    if (isLocale(locale) && locale !== i18n.language) void changeLocale(locale)
  }, [locale])

  if (loading) return <FullScreenMessage messageKey="common.loading" />
  if (!session) return <Navigate to="/login" replace />
  if (profile.isPending) return <FullScreenMessage messageKey="common.loading" />
  if (profile.isError) {
    return (
      <FullScreenMessage
        messageKey="common.profileError"
        actions={[
          { labelKey: 'common.retry', onClick: () => void profile.refetch() },
          { labelKey: 'common.signOut', onClick: () => void supabase.auth.signOut() },
        ]}
      />
    )
  }
  if (areaForRole(profile.data.role) !== area) return <Navigate to={homePathForRole(profile.data.role)} replace />

  return children
}
