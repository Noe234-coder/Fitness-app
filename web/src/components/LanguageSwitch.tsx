import { useTranslation } from 'react-i18next'
import { changeLocale } from '../i18n'
import { LOCALES } from '../i18n/locale'

export function LanguageSwitch() {
  const { t, i18n } = useTranslation()

  return (
    <div role="group" aria-label={t('language.label')} className="flex rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
      {LOCALES.map((locale) => {
        const active = i18n.language === locale
        return (
          <button
            key={locale}
            type="button"
            aria-pressed={active}
            onClick={() => void changeLocale(locale)}
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
