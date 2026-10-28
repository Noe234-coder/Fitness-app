import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { useAuth, useProfile } from '../auth/useAuth'
import { type LoginErrorKey, loginErrorKey } from '../auth/authErrors'
import { homePathForRole } from '../auth/roles'
import { FullScreenMessage } from '../components/FullScreenMessage'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { supabase } from '../lib/supabase'

// text-base (16px) on inputs stops iOS Safari from zooming in when a field gets focus.
const inputClass =
  'h-14 w-full rounded-xl border-slate-200 bg-white px-4 text-base focus:border-primary focus:ring-primary dark:border-slate-800 dark:bg-slate-900'

export function LoginPage() {
  const { t } = useTranslation()
  const { session, loading } = useAuth()
  const profile = useProfile()
  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState<LoginErrorKey | null>(null)

  if (loading || (session && profile.isPending)) return <FullScreenMessage messageKey="common.loading" />
  if (session && profile.data) return <Navigate to={homePathForRole(profile.data.role)} replace />

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    setErrorKey(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get('email')).trim(),
        password: String(form.get('password')),
      })
      if (error) setErrorKey(loginErrorKey(error))
      // On success AuthProvider receives the new session and this page redirects.
    } catch (error) {
      setErrorKey(loginErrorKey(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-10 px-5 py-8">
      <div className="flex justify-end">
        <LanguageSwitch />
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('login.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t('app.tagline')}</p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('login.email')}</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('login.password')}</span>
          <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
        </label>

        {errorKey && (
          <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
            {t(errorKey)}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-14 w-full rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-60"
        >
          {t(submitting ? 'login.submitting' : 'login.submit')}
        </button>
      </form>
    </main>
  )
}
