import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id) || id <= 0)
      return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })

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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id) || id <= 0)
      return NextResponse.json({ error: 'Invalid category id' }, { status: 400 })

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
