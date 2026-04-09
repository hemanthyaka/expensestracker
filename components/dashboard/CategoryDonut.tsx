'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Card }         from '@/components/ui/Card'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

export function CategoryDonut({ month }: { month: string }) {
  const { data, isLoading } = useAnalytics(month)
  const breakdown = data?.categoryBreakdown ?? []

  return (
    <Card accentColor="#8b5cf6">
      <div className="p-5">
        <p className="text-sm font-semibold font-display text-ink tracking-tight mb-0.5">By Category</p>
        <p className="text-xs text-ink-3 font-sans mb-4">This month</p>

        {isLoading ? (
          <div className="h-44 animate-pulse bg-groove/30 rounded-full w-32 mx-auto" />
        ) : breakdown.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-ink-3 text-sm font-sans">
            No data this month
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={breakdown} dataKey="total" nameKey="category.name"
                  innerRadius={42} outerRadius={62} strokeWidth={2} stroke="#07070e">
                  {breakdown.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.category.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#10101e', border: '1px solid #252540', borderRadius: '12px', color: '#f1f5f9', fontSize: 12, fontFamily: 'Lexend' }}
                  formatter={(v: unknown, _: unknown, p: { payload?: { category?: { name?: string } } }) => [fmt(Number(v)), p.payload?.category?.name ?? '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5">
              {breakdown.slice(0, 5).map((item) => (
                <div key={item.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.category.color }} />
                    <span className="text-[11px] text-ink-2 font-sans">{item.category.name}</span>
                  </div>
                  <span className="num text-[11px] font-medium text-ink">{fmt(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
