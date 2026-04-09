import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getUserFromHeaders } from '@/lib/auth'
import { hashPassword, SAFE_USER_SELECT } from '@/lib/auth.server'
import { UpdateUserSchema } from '@/lib/validations/auth'

function requireAdmin(request: Request) {
  const user = getUserFromHeaders(request)
  if (!user || user.role !== 'ADMIN') return null
  return user
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id   = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id }, select: SAFE_USER_SELECT })
  if (!user)  return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin(request)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const body   = await request.json()
  const parsed = UpdateUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })

  const { password, ...rest } = parsed.data
  const data: Record<string, unknown> = { ...rest }
  if (password) data.passwordHash = await hashPassword(password)

  const user = await prisma.user.update({ where: { id }, data, select: SAFE_USER_SELECT })
  return NextResponse.json({ user })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin(request)
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  if (session.userId === id) return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
