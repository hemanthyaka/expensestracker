'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Dialog }     from '@/components/ui/Dialog'
import { Input }      from '@/components/ui/Input'
import { Button }     from '@/components/ui/Button'
import { Select }     from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { useCategories } from '@/lib/hooks/useCategories'
import { useBudget }     from '@/lib/hooks/useBudget'
import { useCreateExpense, useUpdateExpense, type Expense } from '@/lib/hooks/useExpenses'

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

interface Props { open: boolean; onOpenChange: (o: boolean) => void; expense?: Expense }

const EMPTY = { title: '', amount: '', categoryId: '', date: format(new Date(), 'yyyy-MM-dd'), note: '' }

export function ExpenseForm({ open, onOpenChange, expense }: Props) {
  const [form,   setForm]   = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const currentMonth = (form.date || format(new Date(), 'yyyy-MM-dd')).slice(0, 7)
  const { data: categories = [] } = useCategories()
  const { data: budgetRows = [] }  = useBudget(currentMonth)
  const create = useCreateExpense()
  const update = useUpdateExpense()

  useEffect(() => {
    if (expense) setForm({ title: expense.title, amount: String(expense.amount), categoryId: String(expense.categoryId), date: expense.date.slice(0, 10), note: expense.note ?? '' })
    else setForm(EMPTY)
    setErrors({})
  }, [expense, open])

  // Only show categories that have a budget limit set
  const budgetMap = Object.fromEntries(budgetRows.map((r) => [r.category.id, r]))
  const eligibleCategories = categories.filter((c) => budgetMap[c.id]?.limit != null)
  const options = eligibleCategories.map((c) => ({ value: String(c.id), label: c.name }))

  // Remaining budget for selected category
  const selectedBudget = form.categoryId ? budgetMap[Number(form.categoryId)] : null
  const spent          = selectedBudget?.spent ?? 0
  const limit          = selectedBudget?.limit ?? null
  // When editing, add back the original amount (we're replacing it)
  const effectiveSpent = expense && expense.categoryId === Number(form.categoryId)
    ? Math.max(0, spent - expense.amount)
    : spent
  const remaining      = limit != null ? Math.max(0, limit - effectiveSpent) : null
  const enteredAmount  = Number(form.amount) || 0
  const afterRemaining = remaining != null ? remaining - enteredAmount : null
  const wouldExceed    = afterRemaining != null && afterRemaining < 0
  const nearLimit      = afterRemaining != null && afterRemaining >= 0 && afterRemaining < (remaining! * 0.2)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim())                       e.title      = 'Required'
    if (!form.amount || Number(form.amount) <= 0) e.amount     = 'Enter a valid amount'
    if (wouldExceed)                              e.amount     = `Exceeds limit by ${fmt(Math.abs(afterRemaining!))}`
    if (!form.categoryId)                         e.categoryId = 'Select a category'
    if (!form.date)                               e.date       = 'Required'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const payload = { title: form.title.trim(), amount: Number(form.amount), categoryId: Number(form.categoryId), date: form.date, note: form.note.trim() || undefined }
    if (expense) await update.mutateAsync({ id: expense.id, ...payload })
    else         await create.mutateAsync(payload)
    onOpenChange(false)
  }

  const pending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={expense ? 'Edit Expense' : 'New Expense'}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input label="Title" placeholder="e.g. Lunch at Chipotle" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />

        <div className="flex flex-col gap-1.5">
          <Input label="Amount (₹)" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} error={errors.amount} />
          {/* Remaining budget indicator */}
          {remaining != null && form.categoryId && (
            <div className="flex flex-col gap-1.5 px-1">
              {/* Text */}
              <div className={`flex items-center justify-between text-[11px] font-sans ${wouldExceed ? 'text-rose' : nearLimit ? 'text-amber' : 'text-emerald'}`}>
                <span className="flex items-center gap-1">
                  {wouldExceed || nearLimit ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                  {wouldExceed
                    ? `Over by ${fmt(Math.abs(afterRemaining!))}`
                    : enteredAmount > 0
                    ? `${fmt(afterRemaining!)} will remain after this`
                    : `${fmt(remaining)} available`
                  }
                </span>
                <span className="text-ink-4 num">
                  {enteredAmount > 0 ? `${fmt(enteredAmount)} of ${fmt(limit!)}` : `Limit: ${fmt(limit!)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <Select
            label="Category"
            value={form.categoryId}
            onValueChange={(v) => setForm({ ...form, categoryId: v })}
            options={options}
            placeholder={options.length === 0 ? 'Set category limits first…' : 'Select category…'}
          />
          {errors.categoryId && <p className="text-xs text-rose mt-1">{errors.categoryId}</p>}
          {options.length === 0 && (
            <p className="text-[11px] text-ink-4 font-sans mt-1">Go to Budget page to set category limits</p>
          )}
        </div>

        <DatePicker label="Date" value={form.date}
          onChange={(v) => setForm({ ...form, date: v })} error={errors.date} />
        <Input label="Note (optional)" placeholder="Any additional details…" value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })} />

        <div className="flex justify-end gap-2 mt-1">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={pending || options.length === 0}>
            {pending ? 'Saving…' : expense ? 'Save Changes' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
