import { NextResponse }       from 'next/server'
import { prisma }             from '@/lib/prisma'
import { getUserFromHeaders } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getUserFromHeaders(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
      return NextResponse.json({ error: 'Invalid month format' }, { status: 400 })
    const [year, mon] = month.split('-').map(Number)

    const startOfMonth     = new Date(year, mon - 1, 1)
    const endOfMonth       = new Date(year, mon, 1)
    const startOfLastMonth = new Date(year, mon - 2, 1)
    const endOfLastMonth   = new Date(year, mon - 1, 1)

    const uid = user.userId

    const [thisMonthAgg, lastMonthAgg, totalAgg, monthlyBudget] = await Promise.all([
      prisma.expense.aggregate({ where: { userId: uid, date: { gte: startOfMonth, lt: endOfMonth } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId: uid, date: { gte: startOfLastMonth, lt: endOfLastMonth } }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { userId: uid }, _sum: { amount: true } }),
      prisma.monthlyBudget.findUnique({ where: { userId_month: { userId: uid, month } } }),
    ])

    const thisMonth  = Number(thisMonthAgg._sum.amount ?? 0)
    const lastMonth  = Number(lastMonthAgg._sum.amount ?? 0)
    const totalSpent = Number(totalAgg._sum.amount ?? 0)

    let totalBudget     = 0
    let remainingBudget = 0

    if (monthlyBudget) {
      totalBudget     = Number(monthlyBudget.limit)
      remainingBudget = Math.max(0, totalBudget - thisMonth)
    } else {
      const budgets = await prisma.budget.findMany({ where: { userId: uid, month } })
      totalBudget   = budgets.reduce((acc, b) => acc + Number(b.limit), 0)
      if (budgets.length > 0) {
        const categorySpend = await prisma.expense.groupBy({
          by: ['categoryId'],
          where: { userId: uid, date: { gte: startOfMonth, lt: endOfMonth } },
          _sum: { amount: true },
        })
        const spendMap = Object.fromEntries(categorySpend.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]))
        remainingBudget = budgets.reduce((acc, b) => {
          const spent = spendMap[b.categoryId] ?? 0
          return acc + Math.max(0, Number(b.limit) - spent)
        }, 0)
      }
    }

    const thisMonthVsLast = lastMonth === 0 ? 0 : Math.round(((thisMonth - lastMonth) / lastMonth) * 100)

    return NextResponse.json({
      totalSpent, remainingBudget, totalBudget,
      thisMonth, lastMonth, saved: remainingBudget,
      thisMonthVsLast, month,
      hasMonthlyBudget: !!monthlyBudget,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
