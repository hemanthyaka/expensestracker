'use client'

import { useState } from 'react'
import { format, addMonths } from 'date-fns'
import { Plus, Download } from 'lucide-react'
import { StatsCards }       from '@/components/dashboard/StatsCards'
import { SpendingBarChart } from '@/components/dashboard/SpendingBarChart'
import { CategoryDonut }    from '@/components/dashboard/CategoryDonut'
import { RecentExpenses }   from '@/components/dashboard/RecentExpenses'
import { ExpenseForm }      from '@/components/expenses/ExpenseForm'
import { Button }           from '@/components/ui/Button'
import { Select }           from '@/components/ui/Select'
import { useExpenses }      from '@/lib/hooks/useExpenses'

function monthOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = addMonths(new Date(), i)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') }
  })
}

export function UserDashboard() {
  const [month,    setMonth]    = useState(format(new Date(), 'yyyy-MM'))
  const [showForm, setShowForm] = useState(false)
  const { data } = useExpenses({ month, limit: 1 })

  async function handleExport() {
    const res  = await fetch(`/api/expenses?month=${month}&limit=10000`)
    const json = await res.json()
    const rows = json.expenses as Array<{ title: string; amount: number; category: { name: string }; date: string; note: string | null }>
    const csv  = [
      'Title,Amount,Category,Date,Note',
      ...rows.map((e) => `"${e.title}",${e.amount},"${e.category.name}",${e.date.slice(0, 10)},"${e.note ?? ''}"`),
    ].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a   = Object.assign(document.createElement('a'), { href: url, download: `expenses-${month}.csv` })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-rim px-7 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-display text-ink tracking-tight">Dashboard</h1>
          <p className="text-xs text-ink-3 font-sans mt-0.5">
            {format(new Date(month + '-02'), 'MMMM yyyy')} · {data?.total ?? 0} transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select value={month} onValueChange={setMonth} options={monthOptions()} />
          </div>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download size={13} /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={13} /> Add Expense
          </Button>
        </div>
      </div>
      <div className="flex-1 p-7 flex flex-col gap-5">
        <StatsCards month={month} />
        <div className="grid grid-cols-[2fr_1fr] gap-5">
          <SpendingBarChart month={month} />
          <CategoryDonut month={month} />
        </div>
        <RecentExpenses month={month} />
      </div>
      <ExpenseForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
