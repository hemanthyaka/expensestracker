'use client'

import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card }   from '@/components/ui/Card'
import type { BudgetRow } from '@/lib/hooks/useBudget'

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n) }

export function BudgetCard({ row, onEdit }: { row: BudgetRow; onEdit: (r: BudgetRow) => void }) {
  const { category, limit, spent } = row
  const hasLimit  = limit != null
  const pct       = hasLimit ? Math.min(100, (spent / limit!) * 100) : 0
  const remaining = hasLimit ? Math.max(0, limit! - spent) : 0
  const barColor  = pct >= 90 ? '#f43f5e' : pct >= 70 ? '#f59e0b' : '#10b981'

  const iconName = category.icon.split('-').map((s: string) => s[0].toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons
  const Icon = (LucideIcons[iconName] ?? LucideIcons.Circle) as React.ElementType

  return (
    <Card accentColor={category.color}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}18` }}>
              <Icon size={18} style={{ color: category.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold font-display text-ink tracking-tight">{category.name}</p>
              <p className="text-[11px] text-ink-3 font-sans mt-0.5">
                {hasLimit ? `Limit: ${fmt(limit!)}` : 'No limit set'}
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>{hasLimit ? 'Edit' : 'Set Limit'}</Button>
        </div>

        {hasLimit ? (
          <>
            <div className="flex justify-between text-[11px] mb-1.5 font-sans">
              <span className="text-ink-3">Spent</span>
              <span className="num font-semibold" style={{ color: barColor }}>{fmt(spent)} / {fmt(limit!)}</span>
            </div>
            <div className="w-full h-1.5 bg-rim rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: barColor }} />
            </div>
            <div className="flex justify-between text-[10px] mt-1.5 font-sans">
              <span className="text-ink-4">{pct.toFixed(0)}% used</span>
              <span className="num text-ink-2">{fmt(remaining)} left</span>
            </div>
          </>
        ) : (
          <p className="text-[11px] text-ink-3 font-sans">
            Spent so far: <span className="num font-medium text-ink">{fmt(spent)}</span>
          </p>
        )}
      </div>
    </Card>
  )
}
