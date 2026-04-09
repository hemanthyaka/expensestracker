'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Card } from '@/components/ui/Card'

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n) }

export function CategoryPieChart({ month }: { month: string }) {
  const { data, isLoading } = useAnalytics(month)
  const breakdown = data?.categoryBreakdown ?? []
  const total = breakdown.reduce((s, b) => s + b.total, 0)

  return (
    <Card accentColor="#10b981">
      <div className="p-5">
        <p className="text-sm font-semibold font-display text-ink tracking-tight mb-0.5">Spending by Category</p>
        <p className="text-xs text-ink-3 font-sans mb-4">Breakdown for selected month</p>
        {isLoading ? (
          <div className="h-64 animate-pulse bg-groove/30 rounded-full w-40 mx-auto" />
        ) : breakdown.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-ink-3 text-sm font-sans">No data this month</div>
        ) : (
          <div className="flex flex-col gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={breakdown} dataKey="total" nameKey="category.name"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85} strokeWidth={2} stroke="#07070e">
                  {breakdown.map((e) => <Cell key={e.categoryId} fill={e.category.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#10101e', border: '1px solid #252540', borderRadius: '12px', color: '#f1f5f9', fontSize: 12, fontFamily: 'Lexend' }}
                  formatter={(v: unknown, _: unknown, p: { payload?: { category?: { name?: string } } }) => [fmt(Number(v)), p.payload?.category?.name ?? '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {breakdown.map((item) => (
                <div key={item.categoryId} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.category.color }} />
                  <span className="text-xs text-ink-2 font-sans flex-1">{item.category.name}</span>
                  <span className="num text-xs font-medium text-ink">{fmt(item.total)}</span>
                  <span className="text-[10px] text-ink-3 font-mono w-10 text-right">
                    {total ? Math.round((item.total / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
