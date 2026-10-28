import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import es from './es.json'
import { DEFAULT_LOCALE, type Locale, pickLocale, readStoredLocale, storeLocale } from './locale'

// Every valid key, e.g. 'login.errors.network'. Lets components accept a key as a prop, type-checked.
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends object ? Leaves<T[K], `${P}${K}.`> : `${P}${K}`
}[keyof T & string]
export type TranslationKey = Leaves<typeof es>

export const resources = {
  es: { translation: es },
  en: { translation: en },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: pickLocale(readStoredLocale(), navigator.language),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false }, // React already escapes
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})
document.documentElement.lang = i18n.language

export function changeLocale(locale: Locale): Promise<unknown> {
  storeLocale(locale)
  return i18n.changeLanguage(locale)
}

export default i18n
