import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth'
import { changeLocale } from '../i18n'
import { LOCALES, type Locale } from '../i18n/locale'
import { supabase } from '../lib/supabase'

export function LanguageSwitch() {
  const { t, i18n } = useTranslation()
  const { session } = useAuth()
  const queryClient = useQueryClient()

  async function select(locale: Locale) {
    await changeLocale(locale)
    if (!session) return
    // Signed in: remember the choice on the profile so it follows the user to other devices.
    // `locale` is one of the columns users may update (column grant in the RLS migration).
    const userId = session.user.id
    const { error } = await supabase.from('profiles').update({ locale }).eq('id', userId)
    if (!error) void queryClient.invalidateQueries({ queryKey: ['profile', userId] })
  }

  return (
    <div role="group" aria-label={t('language.label')} className="flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
      {LOCALES.map((locale) => {
        const active = i18n.language === locale
        return (
          <button
            key={locale}
            type="button"
            aria-pressed={active}
            onClick={() => void select(locale)}
            className={`h-11 min-w-20 rounded-lg px-3 text-sm font-semibold transition-colors ${
              active ? 'bg-primary text-white' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t(`language.${locale}`)}
          </button>
        )
      })}
    </div>
  )
}
