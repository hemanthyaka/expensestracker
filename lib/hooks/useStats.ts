import { useQuery } from '@tanstack/react-query'

export type Stats = {
  totalSpent: number; remainingBudget: number; totalBudget: number
  thisMonth: number; lastMonth: number; saved: number; thisMonthVsLast: number; month: string
  hasMonthlyBudget: boolean
}

export function useStats(month: string) {
  return useQuery<Stats>({
    queryKey: ['stats', month],
    queryFn:  () => fetch(`/api/stats?month=${month}`).then((r) => r.json()),
  })
}
