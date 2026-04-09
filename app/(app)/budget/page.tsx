'use client'

import { useState } from 'react'
import { format, addMonths } from 'date-fns'
import { Pencil, Check, X } from 'lucide-react'
import { useBudget, type BudgetRow } from '@/lib/hooks/useBudget'
import { useMonthlyBudget, useSetMonthlyBudget } from '@/lib/hooks/useMonthlyBudget'
import { BudgetCard }       from '@/components/budget/BudgetCard'
import { BudgetEditDialog } from '@/components/budget/BudgetEditDialog'
import { Select }           from '@/components/ui/Select'
import { Card }             from '@/components/ui/Card'

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

function monthOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const d = addMonths(new Date(), i)
    return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') }
  })
}

function MonthlyBudgetBar({ month, rows }: { month: string; rows: BudgetRow[] }) {
  const [editing, setEditing] = useState(false)
  const [input,   setInput]   = useState('')

  const { data: mb } = useMonthlyBudget(month)
  const setMB        = useSetMonthlyBudget()

  const monthlyLimit   = mb?.limit ?? null
  const totalAllocated = rows.reduce((s, r) => s + (r.limit ?? 0), 0)
  const totalSpent     = rows.reduce((s, r) => s + r.spent, 0)
  const allocPct       = monthlyLimit ? Math.min(100, (totalAllocated / monthlyLimit) * 100) : 0

  async function save() {
    const val = parseFloat(input)
    if (!isNaN(val) && val > 0) await setMB.mutateAsync({ month, limit: val })
    setEditing(false)
  }

  return (
    <Card accentColor="#8b5cf6" className="mb-6">
      <div className="p-5">
        <p className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.12em] font-display mb-1">Total Monthly Budget</p>

        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-ink-3 font-sans text-sm">₹</span>
            <input
              autoFocus
              type="number" min="1" placeholder="e.g. 50000"
              defaultValue={monthlyLimit ?? ''}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
              className="w-48 bg-canvas border border-violet/40 rounded-lg px-3 py-1.5 text-sm text-ink font-sans focus:outline-none focus:border-violet"
            />
            <button onClick={save} className="w-7 h-7 rounded-lg bg-emerald/15 flex items-center justify-center text-emerald hover:bg-emerald/25 transition-colors"><Check size={12} /></button>
            <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg bg-groove/40 flex items-center justify-center text-ink-3 hover:text-ink transition-colors"><X size={12} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="num text-2xl font-semibold text-ink tracking-tight">
              {monthlyLimit ? fmt(monthlyLimit) : '—'}
            </span>
            <button
              onClick={() => { setInput(String(monthlyLimit ?? '')); setEditing(true) }}
              className="w-6 h-6 rounded-md border border-rim flex items-center justify-center text-ink-4 hover:text-violet hover:border-violet/40 transition-colors"
            >
              <Pencil size={10} />
            </button>
          </div>
        )}

        {monthlyLimit && (
          <div className="mt-3 max-w-sm">
            <div className="flex justify-between text-[11px] text-ink-3 font-sans mb-1">
              <span>Allocated: <span className="text-ink num">{fmt(totalAllocated)}</span></span>
              <span>Spent: <span className="text-rose num">{fmt(totalSpent)}</span></span>
            </div>
            <div className="w-full h-1.5 bg-rim rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${allocPct}%`, backgroundColor: allocPct > 100 ? '#f43f5e' : '#8b5cf6' }}
              />
            </div>
            <p className="text-[10px] text-ink-4 font-sans mt-1">{allocPct.toFixed(0)}% of budget allocated to categories</p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function BudgetPage() {
  const [month,   setMonth]   = useState(format(new Date(), 'yyyy-MM'))
  const [editRow, setEditRow] = useState<BudgetRow | null>(null)
  const { data: rows = [], isLoading } = useBudget(month)

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-rim px-7 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-display text-ink tracking-tight">Budget</h1>
          <p className="text-xs text-ink-3 font-sans mt-0.5">Set monthly budget and manage category limits</p>
        </div>
        <div className="w-44"><Select value={month} onValueChange={setMonth} options={monthOptions()} /></div>
      </div>

      <div className="flex-1 p-7">
        <MonthlyBudgetBar month={month} rows={rows} />

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div className="p-5 space-y-3 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-groove/50" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-groove/50 rounded w-20" />
                      <div className="h-2.5 bg-groove/30 rounded w-28" />
                    </div>
                  </div>
                  <div className="h-1.5 bg-groove/50 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {rows.map((row) => <BudgetCard key={row.category.id} row={row} onEdit={setEditRow} />)}
          </div>
        )}
      </div>

      <BudgetEditDialog open={!!editRow} onOpenChange={(o) => { if (!o) setEditRow(null) }} row={editRow} />
    </div>
  )
}
