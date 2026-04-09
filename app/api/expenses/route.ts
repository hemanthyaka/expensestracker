import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const month    = searchParams.get('month')
    const search   = searchParams.get('search')
    const sort     = searchParams.get('sort') ?? 'newest'
    const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)
    const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '10') || 10))

    const where: Record<string, unknown> = {}
    if (category) where.category = { name: category }
    if (month) {
      if (!MONTH_RE.test(month))
        return NextResponse.json({ error: 'Invalid month format' }, { status: 400 })
      const [year, mon] = month.split('-').map(Number)
      where.date = { gte: new Date(year, mon - 1, 1), lt: new Date(year, mon, 1) }
    }
    if (search) where.title = { contains: search, mode: 'insensitive' }

    const orderBy =
      sort === 'oldest'  ? { date: 'asc'    as const } :
      sort === 'highest' ? { amount: 'desc' as const } :
      sort === 'lowest'  ? { amount: 'asc'  as const } :
                           { date: 'desc'   as const }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where, orderBy,
        skip: (page - 1) * limit, take: limit,
        include: { category: true },
      }),
      prisma.expense.count({ where }),
    ])

    return NextResponse.json({
      expenses: expenses.map((e) => ({
        ...e,
        amount:    Number(e.amount),
        date:      e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
      total, page, pageCount: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, amount, categoryId, date, note } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0 || title.length > 200)
      return NextResponse.json({ error: 'title is required (max 200 chars)' }, { status: 400 })
    if (typeof amount !== 'number' || !isFinite(amount) || amount <= 0 || amount > 1_000_000)
      return NextResponse.json({ error: 'amount must be a positive number ≤ 1,000,000' }, { status: 400 })
    if (!categoryId || isNaN(parseInt(String(categoryId))))
      return NextResponse.json({ error: 'valid categoryId is required' }, { status: 400 })
    if (!date || typeof date !== 'string')
      return NextResponse.json({ error: 'date is required' }, { status: 400 })

    const parsed = new Date(date)
    if (isNaN(parsed.getTime()))
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        amount,
        categoryId: parseInt(String(categoryId)),
        date: parsed,
        note: note && typeof note === 'string' ? note.trim().slice(0, 500) || null : null,
      },
      include: { category: true },
    })
    return NextResponse.json({
      ...expense,
      amount: Number(expense.amount),
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
