import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js'

export type LoginErrorKey =
  | 'login.errors.invalidCredentials'
  | 'login.errors.emailNotConfirmed'
  | 'login.errors.rateLimited'
  | 'login.errors.network'
  | 'login.errors.unknown'

// Supabase messages are English-only, so we map their stable error codes to our own i18n keys.
export function loginErrorKey(error: unknown): LoginErrorKey {
  if (isAuthRetryableFetchError(error)) return 'login.errors.network'
  if (isAuthApiError(error)) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'login.errors.invalidCredentials'
      case 'email_not_confirmed':
        return 'login.errors.emailNotConfirmed'
      case 'over_request_rate_limit':
        return 'login.errors.rateLimited'
    }
  }
  if (error instanceof TypeError) return 'login.errors.network' // fetch failed before reaching Supabase
  return 'login.errors.unknown'
}
