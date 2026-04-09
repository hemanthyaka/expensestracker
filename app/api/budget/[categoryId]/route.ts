import { NextResponse }       from 'next/server'
import { prisma }             from '@/lib/prisma'
import { getUserFromHeaders } from '@/lib/auth'

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

export async function PUT(request: Request, { params }: { params: { categoryId: string } }) {
  const user = getUserFromHeaders(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const categoryId = parseInt(params.categoryId)
    if (isNaN(categoryId) || categoryId <= 0)
      return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 })

    const { limit, month } = await request.json()
    if (typeof limit !== 'number' || !isFinite(limit) || limit <= 0 || limit > 1_000_000)
      return NextResponse.json({ error: 'limit must be a positive number ≤ 1,000,000' }, { status: 400 })
    if (!month || !MONTH_RE.test(month))
      return NextResponse.json({ error: 'month must be in YYYY-MM format' }, { status: 400 })

    const budget = await prisma.budget.upsert({
      where:  { userId_categoryId_month: { userId: user.userId, categoryId, month } },
      update: { limit },
      create: { userId: user.userId, categoryId, limit, month },
      include: { category: true },
    })
    return NextResponse.json({ ...budget, limit: Number(budget.limit) })
  } catch {
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 })
  }
}
