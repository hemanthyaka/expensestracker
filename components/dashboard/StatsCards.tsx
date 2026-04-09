'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CalendarDays, Sparkles, Pencil, X, Check } from 'lucide-react'
import { useStats } from '@/lib/hooks/useStats'
import { useMonthlyBudget, useSetMonthlyBudget } from '@/lib/hooks/useMonthlyBudget'
import { Card } from '@/components/ui/Card'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n)
}

function StatCard({
  label, value, sub, subUp, icon: Icon, accent, delay, action,
}: {
  label: string; value: string; sub?: string; subUp?: boolean
  icon: React.ElementType; accent: string; delay: string
  action?: React.ReactNode
}) {
  return (
    <Card
      accentColor={accent}
      className="opacity-0 animate-fade-up"
      style={{ animationDelay: delay } as React.CSSProperties}
    >
      <div className="p-5 relative">
        <div
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}18` }}
        >
          <Icon size={17} style={{ color: accent }} />
        </div>
        <p className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.12em] font-display mb-2">{label}</p>
        <p className="num text-2xl font-semibold text-ink mb-1.5 tracking-tight">{value}</p>
        {sub && (
          <p className="flex items-center gap-1 text-[11px] font-sans" style={{ color: subUp ? '#10b981' : '#f43f5e' }}>
            {subUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {sub}
          </p>
        )}
        {action}
      </div>
    </Card>
  )
}

function SkeletonCard({ delay }: { delay: string }) {
  return (
    <Card className="opacity-0 animate-fade-up" style={{ animationDelay: delay } as React.CSSProperties}>
      <div className="p-5 space-y-3">
        <div className="h-2.5 bg-groove/60 rounded-full w-20 animate-pulse" />
        <div className="h-7 bg-groove/60 rounded-lg w-32 animate-pulse" />
        <div className="h-2.5 bg-groove/40 rounded-full w-28 animate-pulse" />
      </div>
    </Card>
  )
}

function BudgetCard({ month, data }: { month: string; data: ReturnType<typeof useStats>['data'] }) {
  const [editing, setEditing] = useState(false)
  const [input,   setInput]   = useState('')
  const { data: mb } = useMonthlyBudget(month)
  const setMutation  = useSetMonthlyBudget()

  if (!data) return null

  const accent = '#10b981'

  async function save() {
    const val = parseFloat(input)
    if (!isNaN(val) && val > 0) {
      await setMutation.mutateAsync({ month, limit: val })
    }
    setEditing(false)
  }

  async function clear() {
    await setMutation.mutateAsync({ month, limit: null })
    setEditing(false)
  }

  const hasLimit = data.totalBudget > 0

  return (
    <Card
      accentColor={accent}
      className="opacity-0 animate-fade-up"
      style={{ animationDelay: '0.05s' } as React.CSSProperties}
    >
      <div className="p-5 relative">
        <div
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}18` }}
        >
          <PiggyBank size={17} style={{ color: accent }} />
        </div>

        <p className="text-[10px] font-bold text-ink-3 uppercase tracking-[0.12em] font-display mb-2">Remaining Budget</p>
        <p className="num text-2xl font-semibold text-ink mb-1.5 tracking-tight">{fmt(data.remainingBudget)}</p>

        {hasLimit ? (
          <p className="flex items-center gap-1 text-[11px] font-sans" style={{ color: '#10b981' }}>
            <TrendingUp size={10} />
            {Math.round((data.remainingBudget / data.totalBudget) * 100)}% of {fmt(data.totalBudget)} left
          </p>
        ) : (
          <p className="text-[11px] text-ink-4 font-sans">No budget set</p>
        )}

        {editing ? (
          <div className="mt-3 flex items-center gap-1.5">
            <input
              autoFocus
              type="number"
              min="1"
              placeholder="Enter total budget…"
              defaultValue={mb?.limit ?? ''}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
              className="flex-1 min-w-0 bg-canvas border border-violet/40 rounded-lg px-2.5 py-1.5 text-xs text-ink font-sans focus:outline-none focus:border-violet"
            />
            <button onClick={save} className="w-6 h-6 rounded-md bg-emerald/15 flex items-center justify-center text-emerald hover:bg-emerald/25 transition-colors">
              <Check size={11} />
            </button>
            {hasLimit && (
              <button onClick={clear} className="w-6 h-6 rounded-md bg-rose/15 flex items-center justify-center text-rose hover:bg-rose/25 transition-colors">
                <X size={11} />
              </button>
            )}
            <button onClick={() => setEditing(false)} className="w-6 h-6 rounded-md bg-groove/40 flex items-center justify-center text-ink-3 hover:text-ink transition-colors">
              <X size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setInput(String(mb?.limit ?? '')); setEditing(true) }}
            className="mt-2.5 flex items-center gap-1 text-[10px] text-ink-4 hover:text-violet transition-colors font-sans"
          >
            <Pencil size={9} />
            {hasLimit ? 'Edit budget' : 'Set total budget'}
          </button>
        )}
      </div>
    </Card>
  )
}

export function StatsCards({ month }: { month: string }) {
  const { data, isLoading } = useStats(month)

  if (isLoading) return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {['0s', '0.05s', '0.1s', '0.15s'].map((d) => <SkeletonCard key={d} delay={d} />)}
    </div>
  )

  if (!data) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard
        label="Total Spent"
        value={fmt(data.totalSpent)}
        icon={Wallet}
        accent="#8b5cf6"
        delay="0s"
      />
      <BudgetCard month={month} data={data} />
      <StatCard
        label="This Month"
        value={fmt(data.thisMonth)}
        sub={data.thisMonthVsLast === 0 ? 'Same as last month' : `${Math.abs(data.thisMonthVsLast)}% ${data.thisMonthVsLast > 0 ? 'more' : 'less'} than last month`}
        subUp={data.thisMonthVsLast <= 0}
        icon={CalendarDays}
        accent="#38bdf8"
        delay="0.1s"
      />
      <StatCard
        label="Saved"
        value={fmt(data.saved)}
        sub={data.saved > 0 ? 'Under budget — great job!' : data.totalBudget > 0 ? 'Over budget this month' : 'Set a budget to track savings'}
        subUp={data.saved > 0}
        icon={Sparkles}
        accent="#f59e0b"
        delay="0.15s"
      />
    </div>
  )
}
