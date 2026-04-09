import { NextResponse }       from 'next/server'
import { prisma }             from '@/lib/prisma'
import { getUserFromHeaders } from '@/lib/auth'

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

export async function GET(request: Request) {
  const user = getUserFromHeaders(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7)
    if (!MONTH_RE.test(month))
      return NextResponse.json({ error: 'Invalid month format' }, { status: 400 })
    const record = await prisma.monthlyBudget.findUnique({
      where: { userId_month: { userId: user.userId, month } },
    })
    return NextResponse.json({ month, limit: record ? Number(record.limit) : null })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch monthly budget' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const user = getUserFromHeaders(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { month, limit } = await request.json()
    if (!month || !MONTH_RE.test(month))
      return NextResponse.json({ error: 'month must be in YYYY-MM format' }, { status: 400 })
    if (limit === null || limit === undefined) {
      await prisma.monthlyBudget.deleteMany({ where: { userId: user.userId, month } })
      return NextResponse.json({ month, limit: null })
    }
    if (typeof limit !== 'number' || !isFinite(limit) || limit <= 0 || limit > 100_000_000)
      return NextResponse.json({ error: 'limit must be a positive number' }, { status: 400 })
    const record = await prisma.monthlyBudget.upsert({
      where:  { userId_month: { userId: user.userId, month } },
      update: { limit },
      create: { userId: user.userId, month, limit },
    })
    return NextResponse.json({ month, limit: Number(record.limit) })
  } catch {
    return NextResponse.json({ error: 'Failed to save monthly budget' }, { status: 500 })
  }
}
