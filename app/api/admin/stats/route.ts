import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getSession }   from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getSession(request)
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const now          = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLast  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLast    = new Date(now.getFullYear(), now.getMonth(), 1)

  const [total, admins, newThisMonth, newLastMonth, recent] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfLast, lt: endOfLast } } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, firstName: true, lastName: true, username: true, email: true, role: true, createdAt: true },
    }),
  ])

  // Monthly signups for the last 6 months
  const monthlySignups = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const e = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1)
      return prisma.user.count({ where: { createdAt: { gte: d, lt: e } } }).then((count) => ({
        month: d.toISOString().slice(0, 7),
        count,
      }))
    })
  )

  return NextResponse.json({
    total,
    admins,
    users: total - admins,
    newThisMonth,
    newLastMonth,
    growthPct: newLastMonth === 0 ? 0 : Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100),
    recent,
    monthlySignups,
  })
}
