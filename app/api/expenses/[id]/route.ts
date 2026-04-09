import { NextResponse }       from 'next/server'
import { prisma }             from '@/lib/prisma'
import { getUserFromHeaders } from '@/lib/auth'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromHeaders(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const id = parseInt(params.id)
    if (isNaN(id) || id <= 0)
      return NextResponse.json({ error: 'Invalid expense id' }, { status: 400 })

    // Verify ownership
    const existing = await prisma.expense.findUnique({ where: { id } })
    if (!existing)                        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.userId !== user.userId)  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { title, amount, categoryId, date, note } = body

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0 || title.length > 200))
      return NextResponse.json({ error: 'title must be a non-empty string (max 200 chars)' }, { status: 400 })
    if (amount !== undefined && (typeof amount !== 'number' || !isFinite(amount) || amount <= 0 || amount > 1_000_000))
      return NextResponse.json({ error: 'amount must be a positive number ≤ 1,000,000' }, { status: 400 })

    const parsedCatId = categoryId !== undefined ? parseInt(String(categoryId)) : undefined
    if (parsedCatId !== undefined && isNaN(parsedCatId))
      return NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 })

    let parsedDate: Date | undefined
    if (date !== undefined) {
      parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime()))
        return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(title       !== undefined && { title: title.trim() }),
        ...(amount      !== undefined && { amount }),
        ...(parsedCatId !== undefined && { categoryId: parsedCatId }),
        ...(parsedDate  !== undefined && { date: parsedDate }),
        note: note !== undefined ? (typeof note === 'string' ? note.trim().slice(0, 500) || null : null) : undefined,
      },
      include: { category: true },
    })
    return NextResponse.json({
      ...expense,
      amount:    Number(expense.amount),
      date:      expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromHeaders(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const id = parseInt(params.id)
    if (isNaN(id) || id <= 0)
      return NextResponse.json({ error: 'Invalid expense id' }, { status: 400 })

    const existing = await prisma.expense.findUnique({ where: { id } })
    if (!existing)                       return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing.userId !== user.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
