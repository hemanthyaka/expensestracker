'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { Card } from '@/components/ui/Card'
import { format } from 'date-fns'

const RANGES = ['6M', '1Y', 'All'] as const
type Range = typeof RANGES[number]

function fmt(n: number) { return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` }

export function SpendingBarChart({ month }: { month: string }) {
  const [range, setRange] = useState<Range>('6M')
  const { data, isLoading } = useAnalytics(month)

  const all = data?.monthlyTotals ?? []
  const filtered = range === 'All' ? all : all.slice(-(range === '6M' ? 6 : 12))

  const chartData = filtered.map((m, i) => ({
    month: format(new Date(m.month + '-02'), 'MMM'),
    total: m.total,
    isCurrent: i === filtered.length - 1,
  }))

  return (
    <Card accentColor="#8b5cf6">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold font-display text-ink tracking-tight">Monthly Spending</p>
            <p className="text-xs text-ink-3 font-sans mt-0.5">Historical overview</p>
          </div>
          <div className="flex gap-1 bg-canvas rounded-lg p-0.5 border border-rim">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium font-sans transition-all ${
                  range === r ? 'bg-violet/20 text-violet-light' : 'text-ink-3 hover:text-ink-2'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="h-44 animate-pulse bg-groove/30 rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-ink-3 text-sm font-sans">
            No spending data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={chartData} barSize={26} barCategoryGap="30%">
              <defs>
                <linearGradient id="barGradNormal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c30" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#3d4460', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#3d4460', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} tickFormatter={fmt} width={54} />
              <Tooltip
                contentStyle={{ background: '#10101e', border: '1px solid #252540', borderRadius: '12px', color: '#f1f5f9', fontSize: 12 }}
                itemStyle={{ color: '#f1f5f9', fontSize: 12 }}
                formatter={(v: unknown) => [fmt(Number(v)), 'Spent']}
                cursor={{ fill: '#8b5cf608' }}
              />
              <Bar dataKey="total" radius={[5, 5, 2, 2]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.isCurrent ? 'url(#barGradActive)' : 'url(#barGradNormal)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
