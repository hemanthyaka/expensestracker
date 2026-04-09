import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useMonthlyBudget(month: string) {
  return useQuery({
    queryKey: ['monthly-budget', month],
    queryFn: async () => {
      const res = await fetch(`/api/monthly-budget?month=${month}`)
      return res.json() as Promise<{ month: string; limit: number | null }>
    },
  })
}

export function useSetMonthlyBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ month, limit }: { month: string; limit: number | null }) => {
      const res = await fetch('/api/monthly-budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, limit }),
      })
      return res.json()
    },
    onSuccess: (_data, { month }) => {
      qc.invalidateQueries({ queryKey: ['monthly-budget', month] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
