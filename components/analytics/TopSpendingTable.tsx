'use client'

import { format } from 'date-fns'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n) }

export function TopSpendingTable({ month }: { month: string }) {
  const { data, isLoading } = useAnalytics(month)

  return (
    <Card>
      <div className="px-5 py-4 border-b border-rim">
        <p className="text-sm font-semibold font-display text-ink tracking-tight">Top Expenses</p>
        <p className="text-xs text-ink-3 font-sans mt-0.5">Highest transactions this month</p>
      </div>
      {isLoading ? (
        <div className="divide-y divide-rim/30">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
              <div className="w-5 h-5 bg-groove/50 rounded" /><div className="flex-1 h-3 bg-groove/50 rounded w-32" />
              <div className="h-3 bg-groove/50 rounded w-16" />
            </div>
          ))}
        </div>
      ) : !data?.topExpenses.length ? (
        <div className="flex items-center justify-center py-12 text-ink-3 text-sm font-sans">No expenses this month</div>
      ) : (
        <div className="divide-y divide-rim/30">
          {data.topExpenses.map((e, i) => (
            <div key={e.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#0e0e1c] transition-colors">
              <span className="num text-xs text-ink-4 w-5 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate font-sans">{e.title}</p>
                <p className="text-[11px] text-ink-3 font-sans">{format(new Date(e.date), 'MMM d, yyyy')}</p>
              </div>
              <Badge label={e.category.name} color={e.category.color} />
              <span className="num text-sm font-semibold text-rose ml-2">{fmt(e.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
