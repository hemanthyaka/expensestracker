import { NextResponse }       from 'next/server'
import { prisma }             from '@/lib/prisma'
import { getUserFromHeaders } from '@/lib/auth'

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

async function getOwnedCategory(id: number, userId: number, role: string) {
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) return { error: 'Not found', status: 404 }
  // Admins can edit any; users can only edit their own (not default ones)
  if (role !== 'ADMIN' && category.userId !== userId) return { error: 'Forbidden', status: 403 }
  if (role !== 'ADMIN' && category.userId === null) return { error: 'Cannot modify default categories', status: 403 }
  return { category }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromHeaders(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const id = parseInt(params.id)
    if (isNaN(id) || id <= 0)
      return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })

    const check = await getOwnedCategory(id, user.userId, user.role)
    if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })

    const { name, color, icon } = await request.json()
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 50))
      return NextResponse.json({ error: 'name must be a non-empty string (max 50 chars)' }, { status: 400 })
    if (color !== undefined && !HEX_COLOR_RE.test(color))
      return NextResponse.json({ error: 'color must be a valid hex color (e.g. #8b5cf6)' }, { status: 400 })
    if (icon !== undefined && (typeof icon !== 'string' || icon.trim().length === 0 || icon.length > 50))
      return NextResponse.json({ error: 'icon must be a non-empty string (max 50 chars)' }, { status: 400 })

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name  !== undefined && { name: name.trim() }),
        ...(color !== undefined && { color }),
        ...(icon  !== undefined && { icon: icon.trim() }),
      },
    })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromHeaders(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const id = parseInt(params.id)
    if (isNaN(id) || id <= 0)
      return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })

    const check = await getOwnedCategory(id, user.userId, user.role)
    if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status })

    const count = await prisma.expense.count({ where: { categoryId: id } })
    if (count > 0)
      return NextResponse.json({ error: 'Cannot delete category with existing expenses' }, { status: 409 })
    await prisma.budget.deleteMany({ where: { categoryId: id } })
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
