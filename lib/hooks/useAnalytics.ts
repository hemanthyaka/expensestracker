import { useQuery } from '@tanstack/react-query'
import type { Category } from './useCategories'
import type { Expense } from './useExpenses'

export type MonthlyTotal      = { month: string; total: number }
export type CategoryBreakdown = { categoryId: number; category: Category; total: number; count: number }
export type AnalyticsData     = { monthlyTotals: MonthlyTotal[]; categoryBreakdown: CategoryBreakdown[]; topExpenses: Expense[]; month: string }

export function useAnalytics(month: string) {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', month],
    queryFn:  () => fetch(`/api/analytics?month=${month}`).then((r) => r.json()),
  })
}
