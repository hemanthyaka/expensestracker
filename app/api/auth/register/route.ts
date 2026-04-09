import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { signToken, setAuthCookie }       from '@/lib/auth'
import { hashPassword }                   from '@/lib/auth.server'
import { SAFE_USER_SELECT }               from '@/lib/auth.server'
import { RegisterSchema }                 from '@/lib/validations/auth'

export async function POST(request: Request) {
  try {
    const body   = await request.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { firstName, lastName, username, email, phone, password } = parsed.data

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing) {
      const field = existing.email === email ? 'email' : 'username'
      return NextResponse.json({ errors: { [field]: [`${field === 'email' ? 'Email' : 'Username'} already in use`] } }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { firstName, lastName, username, email, phone: phone || null, passwordHash, role: 'USER' },
      select: SAFE_USER_SELECT,
    })

    const token    = await signToken({ userId: user.id, role: user.role })
    const response = NextResponse.json({ user }, { status: 201 })
    setAuthCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
