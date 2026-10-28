import { useTranslation } from 'react-i18next'
import type { TranslationKey } from '../i18n'

type Action = { labelKey: TranslationKey; onClick: () => void }

export function FullScreenMessage({ messageKey, actions = [] }: { messageKey: TranslationKey; actions?: Action[] }) {
  const { t } = useTranslation()

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-5 text-center">
      <p role="status" className="text-slate-500 dark:text-slate-400">
        {t(messageKey)}
      </p>
      {actions.map(({ labelKey, onClick }) => (
        <button
          key={labelKey}
          type="button"
          onClick={onClick}
          className="h-12 w-full rounded-xl bg-slate-200 font-semibold dark:bg-slate-800"
        >
          {t(labelKey)}
        </button>
      ))}
    </main>
  )
}
