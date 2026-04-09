'use client'

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { format } from 'date-fns'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Card } from '@/components/ui/Card'

function fmt(n: number) { return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` }

export function MonthlyTrendChart({ month }: { month: string }) {
  const { data, isLoading } = useAnalytics(month)
  const chartData = (data?.monthlyTotals ?? []).map((m) => ({
    month: format(new Date(m.month + '-02'), 'MMM yy'),
    total: m.total,
  }))

  return (
    <Card accentColor="#8b5cf6">
      <div className="p-5">
        <p className="text-sm font-semibold font-display text-ink tracking-tight mb-0.5">12-Month Trend</p>
        <p className="text-xs text-ink-3 font-sans mb-4">Spending trajectory over the last year</p>
        {isLoading ? (
          <div className="h-52 animate-pulse bg-groove/30 rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-ink-3 text-sm font-sans">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c30" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#3d4460', fontSize: 11, fontFamily: 'Lexend' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#3d4460', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={fmt} width={54} />
              <Tooltip
                contentStyle={{ background: '#10101e', border: '1px solid #252540', borderRadius: '12px', color: '#f1f5f9', fontSize: 12, fontFamily: 'Lexend' }}
                formatter={(v: unknown) => [fmt(Number(v)), 'Spent']}
                cursor={{ stroke: '#8b5cf644', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} fill="url(#areaGrad)"
                dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
