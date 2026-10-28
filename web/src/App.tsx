import { useTranslation } from 'react-i18next'
import { LanguageSwitch } from './components/LanguageSwitch'

// Temporary screen to eyeball the theme; replaced by the router in slice 3.
export default function App() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-between gap-8 px-5 py-8">
      <div className="flex justify-end">
        <LanguageSwitch />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{t('app.name')}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t('app.tagline')}</p>
      </div>
      <button
        type="button"
        className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20 active:scale-[0.98]"
      >
        {t('placeholder.action')}
      </button>
    </main>
  )
}
