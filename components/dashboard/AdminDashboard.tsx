'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Users, Shield, UserPlus, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card }           from '@/components/ui/Card'
import { useCurrentUser } from '@/lib/hooks/useAuth'

type AdminStats = {
  total: number; admins: number; users: number
  newThisMonth: number; newLastMonth: number; growthPct: number
  recent: Array<{ id: number; firstName: string; lastName: string; username: string; email: string; role: string; createdAt: string }>
  monthlySignups: Array<{ month: string; count: number }>
}

function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn:  () => fetch('/api/admin/stats').then((r) => r.json()),
    refetchInterval: 30_000,
  })
}

function StatCard({ label, value, sub, subUp, icon: Icon, accent, delay }: {
  label: string; value: string | number; sub?: string; subUp?: boolean
  icon: React.ElementType; accent: string; delay: string
}) {
  return (
    <Card accentColor={accent} className="opacity-0 animate-fade-up" style={{ animationDelay: delay } as React.CSSProperties}>
      <div className="p-5 relative">
        <div className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}18` }}>
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
      </div>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card>
      <div className="p-5 space-y-3 animate-pulse">
        <div className="h-2.5 bg-groove/60 rounded-full w-20" />
        <div className="h-7 bg-groove/60 rounded-lg w-16" />
        <div className="h-2.5 bg-groove/40 rounded-full w-28" />
      </div>
    </Card>
  )
}

export function AdminDashboard() {
  const { data: user }      = useCurrentUser()
  const { data, isLoading } = useAdminStats()

  const chartData = (data?.monthlySignups ?? []).map((m) => ({
    month: format(new Date(m.month + '-02'), 'MMM yy'),
    count: m.count,
  }))

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base/80 backdrop-blur-xl border-b border-rim px-4 sm:px-7 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg font-bold font-display text-ink tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-ink-3 font-sans mt-0.5">
            Welcome back, {user?.firstName} · {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <Link href="/admin/users">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet/10 border border-violet/20 text-violet-light text-xs font-medium font-sans hover:bg-violet/15 transition-colors">
            <Users size={13} /> <span className="hidden sm:inline">Manage Users</span><span className="sm:hidden">Users</span> <ArrowRight size={11} />
          </button>
        </Link>
      </div>

      <div className="flex-1 p-4 sm:p-7 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Total Users"    value={data!.total}         icon={Users}    accent="#8b5cf6" delay="0s" />
              <StatCard label="Admin Accounts" value={data!.admins}        icon={Shield}   accent="#10b981" delay="0.05s" />
              <StatCard label="New This Month" value={data!.newThisMonth}  icon={UserPlus} accent="#38bdf8" delay="0.1s"
                sub={data!.newLastMonth > 0
                  ? `${Math.abs(data!.growthPct)}% ${data!.growthPct >= 0 ? 'more' : 'less'} than last month`
                  : `${data!.newLastMonth} last month`}
                subUp={data!.growthPct >= 0}
              />
              <StatCard label="Regular Users"  value={data!.users}         icon={Users}    accent="#f59e0b" delay="0.15s" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* Monthly signups chart */}
          <Card accentColor="#8b5cf6">
            <div className="p-5">
              <p className="text-sm font-semibold font-display text-ink tracking-tight mb-0.5">Monthly Signups</p>
              <p className="text-xs text-ink-3 font-sans mb-4">New registrations over the last 6 months</p>
              {isLoading ? (
                <div className="h-44 animate-pulse bg-groove/30 rounded-xl" />
              ) : chartData.every((d) => d.count === 0) ? (
                <div className="h-44 flex items-center justify-center text-ink-3 text-sm font-sans">No signups yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={176}>
                  <BarChart data={chartData} barSize={28} barCategoryGap="30%">
                    <defs>
                      <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1c30" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#3d4460', fontSize: 11, fontFamily: 'Lexend' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#3d4460', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                    <Tooltip
                      contentStyle={{ background: '#10101e', border: '1px solid #252540', borderRadius: '12px', color: '#f1f5f9', fontSize: 12, fontFamily: 'Lexend' }}
                      formatter={(v: unknown) => [String(v), 'Signups']}
                      cursor={{ fill: '#8b5cf608' }}
                    />
                    <Bar dataKey="count" radius={[5, 5, 2, 2]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i === chartData.length - 1 ? 'url(#adminBarGrad)' : '#8b5cf640'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Recent users */}
          <Card accentColor="#10b981">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold font-display text-ink tracking-tight">Recent Registrations</p>
                  <p className="text-xs text-ink-3 font-sans">Latest users to join</p>
                </div>
                <Link href="/admin/users" className="text-[10px] text-violet-light hover:text-violet font-sans flex items-center gap-0.5 transition-colors">
                  View all <ArrowRight size={9} />
                </Link>
              </div>
              {isLoading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-groove/50 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 bg-groove/50 rounded w-24" />
                        <div className="h-2 bg-groove/30 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (data?.recent ?? []).length === 0 ? (
                <p className="text-sm text-ink-3 font-sans text-center py-8">No users yet</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {(data?.recent ?? []).map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet/15 border border-violet/20 flex items-center justify-center text-[10px] font-bold text-violet-light font-display flex-shrink-0">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink font-sans truncate">{u.firstName} {u.lastName}</p>
                        <p className="text-[10px] text-ink-4 font-sans truncate">{u.email}</p>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium font-sans flex-shrink-0 ${u.role === 'ADMIN' ? 'bg-violet/15 text-violet-light' : 'bg-groove/50 text-ink-3'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
