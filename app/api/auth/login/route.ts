import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { verifyPassword, checkRateLimit, clearRateLimit, SAFE_USER_SELECT } from '@/lib/auth.server'
import { LoginSchema } from '@/lib/validations/auth'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  const rateCheck = checkRateLimit(ip)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter) } }
    )
  }

  try {
    const body   = await request.json()
    const parsed = LoginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    clearRateLimit(ip)

    const safeUser = await prisma.user.findUnique({ where: { id: user.id }, select: SAFE_USER_SELECT })
    const token    = await signToken({ userId: user.id, role: user.role })
    const response = NextResponse.json({ user: safeUser })
    setAuthCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
