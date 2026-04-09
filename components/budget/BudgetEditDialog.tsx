'use client'

import { useState, useEffect } from 'react'
import { Dialog }   from '@/components/ui/Dialog'
import { Input }    from '@/components/ui/Input'
import { Button }   from '@/components/ui/Button'
import { useSetBudget, type BudgetRow } from '@/lib/hooks/useBudget'

interface Props { open: boolean; onOpenChange: (o: boolean) => void; row: BudgetRow | null }

export function BudgetEditDialog({ open, onOpenChange, row }: Props) {
  const [limit, setLimit] = useState('')
  const mutation = useSetBudget()

  useEffect(() => { setLimit(row?.limit != null ? String(row.limit) : '') }, [row, open])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!row || !limit || Number(limit) <= 0) return
    await mutation.mutateAsync({ categoryId: row.category.id, limit: Number(limit), month: row.month })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={`Budget — ${row?.category.name ?? ''}`}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-ink-2 font-sans">
          Monthly limit for <span className="text-ink font-medium">{row?.category.name}</span>.
          {' '}Spent so far: <span className="num font-semibold" style={{ color: row?.category.color }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row?.spent ?? 0)}
          </span>
        </p>
        <Input label="Monthly limit (₹)" type="number" step="1" min="1" placeholder="5000" value={limit}
          onChange={(e) => setLimit(e.target.value)} />
        <div className="flex justify-end gap-2 mt-1">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save Limit'}</Button>
        </div>
      </form>
    </Dialog>
  )
}
