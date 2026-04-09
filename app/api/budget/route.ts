import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)
    const [year, mon] = month.split('-').map(Number)
    const startOfMonth = new Date(year, mon - 1, 1)
    const endOfMonth   = new Date(year, mon, 1)

    const [categories, budgets, spending] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.budget.findMany({ where: { month } }),
      prisma.expense.groupBy({
        by: ['categoryId'],
        where: { date: { gte: startOfMonth, lt: endOfMonth } },
        _sum: { amount: true },
      }),
    ])

    const budgetMap = Object.fromEntries(budgets.map((b) => [b.categoryId, Number(b.limit)]))
    const spendMap  = Object.fromEntries(spending.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]))

    return NextResponse.json(
      categories.map((cat) => ({
        category: cat,
        limit:    budgetMap[cat.id] ?? null,
        spent:    spendMap[cat.id]  ?? 0,
        month,
      }))
    )
  } catch {
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 })
  }
}
