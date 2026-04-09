import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Category } from './useCategories'

export type BudgetRow = { category: Category; limit: number | null; spent: number; month: string }

export function useBudget(month: string) {
  return useQuery<BudgetRow[]>({
    queryKey: ['budget', month],
    queryFn:  () => fetch(`/api/budget?month=${month}`).then((r) => r.json()).then((d) => Array.isArray(d) ? d : []),
  })
}

export function useSetBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, limit, month }: { categoryId: number; limit: number; month: string }) =>
      fetch(`/api/budget/${categoryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit, month }) }).then((r) => r.json()),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['budget', v.month] })
      qc.invalidateQueries({ queryKey: ['stats', v.month] })
      toast.success('Budget limit saved')
    },
    onError: () => toast.error('Failed to save budget'),
  })
}
