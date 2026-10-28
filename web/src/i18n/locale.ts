export const LOCALES = ['es', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'es'

const STORAGE_KEY = 'locale'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

// Order: what the user chose before -> the phone's language -> Spanish.
export function pickLocale(stored: string | null, browserLanguage: string | undefined): Locale {
  if (isLocale(stored)) return stored
  const base = browserLanguage?.slice(0, 2).toLowerCase()
  return isLocale(base) ? base : DEFAULT_LOCALE
}

export function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null // private mode or blocked storage
  }
}

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // not critical: the language just won't be remembered
  }
}
