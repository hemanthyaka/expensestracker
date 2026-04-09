import { CategoryManager } from '@/components/settings/CategoryManager'
import { PreferencesForm } from '@/components/settings/PreferencesForm'

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full page-enter">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-rim px-4 sm:px-7 py-4">
        <h1 className="text-lg font-bold font-display text-ink tracking-tight">Settings</h1>
        <p className="text-xs text-ink-3 font-sans mt-0.5">Manage categories and preferences</p>
      </div>
      <div className="flex-1 p-4 sm:p-7 flex flex-col gap-5 max-w-2xl">
        <CategoryManager />
        <PreferencesForm />
      </div>
    </div>
  )
}
