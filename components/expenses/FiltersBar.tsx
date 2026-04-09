'use client'

import { Search, X, SlidersHorizontal } from 'lucide-react'
import { format, addMonths } from 'date-fns'
import { useState } from 'react'
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
  const [showFilters, setShowFilters] = useState(false)
  const catOptions = [{ value: ALL_CAT, label: 'All categories' }, ...categories.map((c) => ({ value: c.name, label: c.name }))]
  const set = (k: keyof Filters, v: string) => onChange({ ...filters, [k]: v })
  const hasFilters = filters.search || filters.category || filters.sort !== 'newest'

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: search + filter toggle (mobile) / all filters (desktop) */}
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

        {/* Desktop filters inline */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-40"><Select value={filters.category || ALL_CAT} onValueChange={(v) => set('category', v === ALL_CAT ? '' : v)} options={catOptions} placeholder="All categories" /></div>
          <div className="w-36"><Select value={filters.month} onValueChange={(v) => set('month', v)} options={monthOptions()} /></div>
          <div className="w-36"><Select value={filters.sort} onValueChange={(v) => set('sort', v)} options={SORT} /></div>
          {hasFilters && (
            <button
              onClick={() => onChange({ search: '', category: '', month: format(new Date(), 'yyyy-MM'), sort: 'newest' })}
              className="text-xs text-ink-3 hover:text-ink flex items-center gap-1 font-sans transition-colors whitespace-nowrap"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`sm:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium font-sans transition-colors flex-shrink-0 ${
            showFilters || hasFilters
              ? 'bg-violet/10 border-violet/30 text-violet-light'
              : 'border-rim text-ink-3 hover:text-ink'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters{hasFilters ? ' •' : ''}
        </button>
      </div>

      {/* Mobile expanded filters */}
      {showFilters && (
        <div className="sm:hidden flex flex-col gap-2.5">
          <Select value={filters.category || ALL_CAT} onValueChange={(v) => set('category', v === ALL_CAT ? '' : v)} options={catOptions} placeholder="All categories" />
          <div className="grid grid-cols-2 gap-2.5">
            <Select value={filters.month} onValueChange={(v) => set('month', v)} options={monthOptions()} />
            <Select value={filters.sort} onValueChange={(v) => set('sort', v)} options={SORT} />
          </div>
          {hasFilters && (
            <button
              onClick={() => { onChange({ search: '', category: '', month: format(new Date(), 'yyyy-MM'), sort: 'newest' }); setShowFilters(false) }}
              className="text-xs text-ink-3 hover:text-ink flex items-center gap-1 font-sans transition-colors"
            >
              <X size={11} /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
