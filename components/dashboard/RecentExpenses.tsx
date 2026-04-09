'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import * as LucideIcons from 'lucide-react'
import { CreditCard } from 'lucide-react'
import { useExpenses } from '@/lib/hooks/useExpenses'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

function CatIcon({ icon, color }: { icon: string; color: string }) {
  const name = icon.split('-').map((s: string) => s[0].toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons
  const Icon = (LucideIcons[name] ?? LucideIcons.Circle) as React.ElementType
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}18` }}>
      <Icon size={15} style={{ color }} />
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

export function RecentExpenses({ month }: { month: string }) {
  const { data, isLoading } = useExpenses({ month, limit: 5, sort: 'newest' })

  return (
    <Card>
      <div className="flex items-center justify-between px-5 py-4 border-b border-rim">
        <p className="text-sm font-semibold font-display text-ink tracking-tight">Recent Expenses</p>
        <Link href="/expenses" className="text-xs text-violet hover:text-violet-light transition-colors font-sans">
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="divide-y divide-rim/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-groove/50" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-groove/50 rounded w-32" />
                <div className="h-2.5 bg-groove/30 rounded w-20" />
              </div>
              <div className="h-4 bg-groove/50 rounded w-16" />
            </div>
          ))}
        </div>
      ) : !data?.expenses.length ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <CreditCard size={28} className="text-ink-4" />
          <p className="text-sm text-ink-3 font-sans">No expenses this month</p>
          <Link href="/expenses" className="text-xs text-violet hover:text-violet-light font-sans">
            Add your first expense →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-rim/50">
          {data.expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-groove/20 transition-colors">
              <CatIcon icon={e.category.icon} color={e.category.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate font-sans">{e.title}</p>
                <p className="text-[11px] text-ink-3 mt-0.5 font-sans">
                  {e.category.name} · {format(new Date(e.date), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge label={e.category.name} color={e.category.color} />
              <span className="num text-sm font-semibold text-rose ml-2">-{fmt(e.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
