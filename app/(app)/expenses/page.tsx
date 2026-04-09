'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { FiltersBar, type Filters } from '@/components/expenses/FiltersBar'
import { ExpenseTable }             from '@/components/expenses/ExpenseTable'
import { ExpenseForm }              from '@/components/expenses/ExpenseForm'
import { Button }                   from '@/components/ui/Button'
import { useExpenses }              from '@/lib/hooks/useExpenses'

const DEFAULT: Filters = { search: '', category: '', month: format(new Date(), 'yyyy-MM'), sort: 'newest' }

export default function ExpensesPage() {
  const [filters,  setFilters]  = useState<Filters>(DEFAULT)
  const [showForm, setShowForm] = useState(false)
  const { data } = useExpenses({ month: filters.month, limit: 1 })

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-rim px-7 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-display text-ink tracking-tight">Expenses</h1>
          <p className="text-xs text-ink-3 font-sans mt-0.5">
            {data?.total ?? 0} transactions · {format(new Date(filters.month + '-02'), 'MMMM yyyy')}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={13} /> Add Expense</Button>
      </div>

      <div className="flex-1 p-7 flex flex-col gap-5">
        <FiltersBar filters={filters} onChange={setFilters} />
        <ExpenseTable filters={{ ...filters, sort: filters.sort as 'newest' | 'oldest' | 'highest' | 'lowest' }} />
      </div>

      <ExpenseForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
