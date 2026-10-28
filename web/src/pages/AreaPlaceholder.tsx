import { useTranslation } from 'react-i18next'
import { useProfile } from '../auth/useAuth'
import type { Area } from '../auth/roles'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { supabase } from '../lib/supabase'

// Stand-in home screens until steps 2 (athlete) and 5 (coach) build the real ones.
export function AreaPlaceholder({ area }: { area: Area }) {
  const { t } = useTranslation()
  const { data: profile } = useProfile()

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-5 py-8">
      <div className="flex justify-end">
        <LanguageSwitch />
      </div>
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t(`area.${area}.title`)}</p>
        <h1 className="text-3xl font-bold tracking-tight">
          {profile?.full_name ? t('area.greetingName', { name: profile.full_name }) : t('area.greeting')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{t(`area.${area}.body`)}</p>
      </header>
      <button
        type="button"
        onClick={() => void supabase.auth.signOut()}
        className="mt-auto h-14 w-full rounded-xl bg-slate-200 text-lg font-semibold dark:bg-slate-800"
      >
        {t('common.signOut')}
      </button>
    </main>
  )
}
