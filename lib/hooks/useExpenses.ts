import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Category } from './useCategories'

export type Expense = {
  id: number; title: string; amount: number; categoryId: number;
  category: Category; date: string; note: string | null; createdAt: string
}
export type ExpensesResponse = { expenses: Expense[]; total: number; page: number; pageCount: number }
export type ExpenseFilters = {
  category?: string; month?: string; search?: string
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest'; page?: number; limit?: number
}

function buildParams(f: ExpenseFilters) {
  const p = new URLSearchParams()
  if (f.category) p.set('category', f.category)
  if (f.month)    p.set('month', f.month)
  if (f.search)   p.set('search', f.search)
  if (f.sort)     p.set('sort', f.sort)
  if (f.page)     p.set('page', String(f.page))
  if (f.limit)    p.set('limit', String(f.limit))
  return p.toString()
}

export function useExpenses(filters: ExpenseFilters = {}) {
  return useQuery<ExpensesResponse>({
    queryKey: ['expenses', filters],
    queryFn:  () => fetch(`/api/expenses?${buildParams(filters)}`).then((r) => r.json()),
  })
}

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['expenses'] })
  qc.invalidateQueries({ queryKey: ['stats'] })
  qc.invalidateQueries({ queryKey: ['analytics'] })
  qc.invalidateQueries({ queryKey: ['budget'] })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; amount: number; categoryId: number; date: string; note?: string }) =>
      fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { invalidateAll(qc); toast.success('Expense added') },
    onError:   () => toast.error('Failed to add expense'),
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; title: string; amount: number; categoryId: number; date: string; note?: string }) =>
      fetch(`/api/expenses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { invalidateAll(qc); toast.success('Expense updated') },
    onError:   () => toast.error('Failed to update expense'),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => fetch(`/api/expenses/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => { invalidateAll(qc); toast.success('Expense deleted') },
    onError:   () => toast.error('Failed to delete expense'),
  })
}
