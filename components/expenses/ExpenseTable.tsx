'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useExpenses, useDeleteExpense, type Expense, type ExpenseFilters } from '@/lib/hooks/useExpenses'
import { useBudget } from '@/lib/hooks/useBudget'
import { Badge }       from '@/components/ui/Badge'
import { Card }        from '@/components/ui/Card'
import { Button }      from '@/components/ui/Button'
import { Dialog }      from '@/components/ui/Dialog'
import { ExpenseForm } from './ExpenseForm'

function CatIcon({ icon, color }: { icon: string; color: string }) {
  const name = icon.split('-').map((s: string) => s[0].toUpperCase() + s.slice(1)).join('') as keyof typeof LucideIcons
  const Icon = (LucideIcons[name] ?? LucideIcons.Circle) as React.ElementType
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
      <Icon size={14} style={{ color }} />
    </div>
  )
}

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n) }

function amountColor(categoryId: number, budgetMap: Record<number, { limit: number | null; spent: number }>) {
  const row = budgetMap[categoryId]
  if (!row || row.limit == null) return '#f43f5e'
  const pct = (row.spent / row.limit) * 100
  if (pct >= 90) return '#f43f5e'
  if (pct >= 70) return '#f59e0b'
  return '#10b981'
}

export function ExpenseTable({ filters }: { filters: ExpenseFilters }) {
  const [page, setPage]     = useState(1)
  const [edit, setEdit]     = useState<Expense | null>(null)
  const [del,  setDel]      = useState<Expense | null>(null)
  const { data, isLoading } = useExpenses({ ...filters, page, limit: 10 })
  const { data: budgetRows = [] } = useBudget(filters.month ?? format(new Date(), 'yyyy-MM'))
  const deleteMutation      = useDeleteExpense()

  const budgetMap: Record<number, { limit: number | null; spent: number }> = {}
  for (const r of budgetRows) budgetMap[r.category.id] = { limit: r.limit, spent: r.spent }

  if (isLoading) return (
    <Card>
      <div className="divide-y divide-rim/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 sm:px-5 py-4 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-groove/50 flex-shrink-0" />
            <div className="flex-1 space-y-1.5"><div className="h-3 bg-groove/50 rounded w-36" /><div className="h-2.5 bg-groove/30 rounded w-22" /></div>
            <div className="h-3 bg-groove/50 rounded w-16" />
          </div>
        ))}
      </div>
    </Card>
  )

  if (!data?.expenses.length) return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 text-ink-3 gap-2 font-sans">
        <p className="text-sm">No expenses found</p>
        <p className="text-xs text-ink-4">Try adjusting your filters</p>
      </div>
    </Card>
  )

  return (
    <>
      <Card>
        {/* Desktop table */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_76px] px-5 py-3 border-b border-rim">
            {['Description', 'Category', 'Date', 'Amount', ''].map((h, i) => (
              <p key={i} className="text-[10px] font-bold text-ink-4 uppercase tracking-widest font-display last:text-right">{h}</p>
            ))}
          </div>
          <div className="divide-y divide-rim/30">
            {data.expenses.map((e) => (
              <div key={e.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_76px] px-5 py-3.5 items-center hover:bg-[#0e0e1c] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <CatIcon icon={e.category.icon} color={e.category.color} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate font-sans">{e.title}</p>
                    {e.note && <p className="text-[11px] text-ink-3 truncate font-sans">{e.note}</p>}
                  </div>
                </div>
                <Badge label={e.category.name} color={e.category.color} />
                <p className="text-[12px] text-ink-2 font-sans">{format(new Date(e.date), 'MMM d, yyyy')}</p>
                <p className="num text-sm font-semibold" style={{ color: amountColor(e.categoryId, budgetMap) }}>
                  {fmt(e.amount)}
                </p>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => setEdit(e)} className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-ink hover:bg-canvas transition-colors"><Pencil size={11} /></button>
                  <button onClick={() => setDel(e)}  className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-rose hover:border-rose/30 transition-colors"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-rim/30">
          {data.expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#0e0e1c] transition-colors">
              <CatIcon icon={e.category.icon} color={e.category.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate font-sans">{e.title}</p>
                <p className="text-[11px] text-ink-3 font-sans mt-0.5">
                  {e.category.name} · {format(new Date(e.date), 'MMM d')}
                </p>
              </div>
              <p className="num text-sm font-semibold flex-shrink-0" style={{ color: amountColor(e.categoryId, budgetMap) }}>
                {fmt(e.amount)}
              </p>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEdit(e)} className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-ink transition-colors"><Pencil size={11} /></button>
                <button onClick={() => setDel(e)}  className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-rose transition-colors"><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>

        {data.pageCount > 1 && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-t border-rim">
            <p className="text-xs text-ink-3 font-sans">
              {(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)} of {data.total}
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-ink disabled:opacity-30 transition-colors">
                <ChevronLeft size={12} />
              </button>
              {Array.from({ length: data.pageCount }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-mono transition-colors ${p === page ? 'bg-violet text-white' : 'border border-rim text-ink-3 hover:text-ink'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(data.pageCount, p + 1))} disabled={page === data.pageCount}
                className="w-7 h-7 rounded-lg border border-rim flex items-center justify-center text-ink-3 hover:text-ink disabled:opacity-30 transition-colors">
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </Card>

      <ExpenseForm open={!!edit} onOpenChange={(o) => { if (!o) setEdit(null) }} expense={edit ?? undefined} />

      <Dialog open={!!del} onOpenChange={(o) => { if (!o) setDel(null) }} title="Delete Expense">
        <p className="text-sm text-ink-2 font-sans mb-5">
          Delete <span className="text-ink font-medium">&quot;{del?.title}&quot;</span>? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDel(null)}>Cancel</Button>
          <Button variant="danger" onClick={async () => { if (del) { await deleteMutation.mutateAsync(del.id); setDel(null) } }} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Dialog>
    </>
  )
}
