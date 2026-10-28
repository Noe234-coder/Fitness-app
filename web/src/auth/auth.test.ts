import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { loginErrorKey } from './authErrors'
import { homePathForRole } from './roles'

describe('homePathForRole', () => {
  it('sends athletes to the athlete area', () => {
    expect(homePathForRole('athlete')).toBe('/athlete')
  })
  it('sends coaches and admins to the coach area', () => {
    expect(homePathForRole('coach')).toBe('/coach')
    expect(homePathForRole('admin')).toBe('/coach')
  })
})

describe('loginErrorKey', () => {
  it('maps a wrong password to our own message', () => {
    expect(loginErrorKey(new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'))).toBe(
      'login.errors.invalidCredentials',
    )
  })
  it('maps network failures', () => {
    expect(loginErrorKey(new AuthRetryableFetchError('Failed to fetch', 0))).toBe('login.errors.network')
    expect(loginErrorKey(new TypeError('Failed to fetch'))).toBe('login.errors.network')
  })
  it('never leaks unknown English messages', () => {
    expect(loginErrorKey(new AuthApiError('Something new', 500, 'unexpected_failure'))).toBe('login.errors.unknown')
    expect(loginErrorKey('weird')).toBe('login.errors.unknown')
  })
})
