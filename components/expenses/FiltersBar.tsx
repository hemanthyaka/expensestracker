'use client'

import { Search, X } from 'lucide-react'
import { format, addMonths } from 'date-fns'
import { useCategories } from '@/lib/hooks/useCategories'
import { Select } from '@/components/ui/Select'

export type Filters = { search: string; category: string; month: string; sort: string }

interface Props { filters: Filters; onChange: (f: Filters) => void }

function monthOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = addMonths(new Date(), i)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') }
  })
}

const SORT = [
  { value: 'newest',  label: 'Newest first' },
  { value: 'oldest',  label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest',  label: 'Lowest amount' },
]

const ALL_CAT = '__all__'

export function FiltersBar({ filters, onChange }: Props) {
  const { data: categories = [] } = useCategories()
  const catOptions = [{ value: ALL_CAT, label: 'All categories' }, ...categories.map((c) => ({ value: c.name, label: c.name }))]
  const set = (k: keyof Filters, v: string) => onChange({ ...filters, [k]: v })
  const hasFilters = filters.search || filters.category || filters.sort !== 'newest'

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4" />
        <input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Search expenses…"
          className="w-full bg-card border border-rim rounded-xl pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-ink-4 font-sans focus:outline-none focus:border-violet transition-colors"
        />
      </div>
      <div className="w-44"><Select value={filters.category || ALL_CAT} onValueChange={(v) => set('category', v === ALL_CAT ? '' : v)} options={catOptions} placeholder="All categories" /></div>
      <div className="w-40"><Select value={filters.month} onValueChange={(v) => set('month', v)} options={monthOptions()} /></div>
      <div className="w-40"><Select value={filters.sort} onValueChange={(v) => set('sort', v)} options={SORT} /></div>
      {hasFilters && (
        <button
          onClick={() => onChange({ search: '', category: '', month: format(new Date(), 'yyyy-MM'), sort: 'newest' })}
          className="text-xs text-ink-3 hover:text-ink flex items-center gap-1 font-sans transition-colors whitespace-nowrap"
        >
          <X size={11} /> Clear
        </button>
      )}
    </div>
  )
}
