import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, color, icon } = await request.json()
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 50)
      return NextResponse.json({ error: 'name is required (max 50 chars)' }, { status: 400 })
    if (!color || !HEX_COLOR_RE.test(color))
      return NextResponse.json({ error: 'color must be a valid hex color (e.g. #8b5cf6)' }, { status: 400 })
    if (!icon || typeof icon !== 'string' || icon.trim().length === 0 || icon.length > 50)
      return NextResponse.json({ error: 'icon is required (max 50 chars)' }, { status: 400 })

    const category = await prisma.category.create({ data: { name: name.trim(), color, icon: icon.trim() } })
    return NextResponse.json(category, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create category'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
