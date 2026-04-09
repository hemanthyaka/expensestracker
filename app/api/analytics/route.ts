import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)
    const [year, mon] = month.split('-').map(Number)

    const startOfMonth    = new Date(year, mon - 1, 1)
    const endOfMonth      = new Date(year, mon, 1)
    const twelveMonthsAgo = new Date(year, mon - 13, 1)

    const monthlyTotals = await prisma.$queryRaw<Array<{ month: string; total: number }>>(
      Prisma.sql`
        SELECT
          TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
          CAST(SUM(amount) AS FLOAT)                    AS total
        FROM "Expense"
        WHERE date >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date) ASC
      `
    )

    const categorySpend = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: { date: { gte: startOfMonth, lt: endOfMonth } },
      _sum: { amount: true },
      _count: { id: true },
    })

    const categoryIds = categorySpend.map((s) => s.categoryId)
    const categories  = categoryIds.length
      ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
      : []
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))

    const categoryBreakdown = categorySpend.map((s) => ({
      categoryId: s.categoryId,
      category:   catMap[s.categoryId],
      total:      Number(s._sum.amount ?? 0),
      count:      s._count.id,
    }))

    const topExpenses = await prisma.expense.findMany({
      where: { date: { gte: startOfMonth, lt: endOfMonth } },
      orderBy: { amount: 'desc' },
      take: 10,
      include: { category: true },
    })

    return NextResponse.json({
      monthlyTotals,
      categoryBreakdown,
      topExpenses: topExpenses.map((e) => ({
        ...e,
        amount: Number(e.amount),
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
      month,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
