import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getUserFromHeaders } from '@/lib/auth'
import { hashPassword, SAFE_USER_SELECT } from '@/lib/auth.server'
import { RegisterSchema } from '@/lib/validations/auth'

function requireAdmin(request: Request) {
  const user = getUserFromHeaders(request)
  if (!user || user.role !== 'ADMIN') return null
  return user
}

export async function GET(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const role   = searchParams.get('role') as 'ADMIN' | 'USER' | null

  const users = await prisma.user.findMany({
    where: {
      ...(role   && { role }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { email:     { contains: search, mode: 'insensitive' } },
          { username:  { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    select:  SAFE_USER_SELECT,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body   = await request.json()
  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })

  const { firstName, lastName, username, email, phone, password } = parsed.data
  const role = body.role === 'ADMIN' ? 'ADMIN' : 'USER'

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
  if (existing) {
    const field = existing.email === email ? 'email' : 'username'
    return NextResponse.json({ errors: { [field]: [`${field === 'email' ? 'Email' : 'Username'} already in use`] } }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { firstName, lastName, username, email, phone: phone || null, passwordHash, role },
    select: SAFE_USER_SELECT,
  })

  return NextResponse.json({ user }, { status: 201 })
}
