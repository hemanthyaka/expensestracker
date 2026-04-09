import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return { userId: payload.userId as number, role: payload.role as 'ADMIN' | 'USER' }
  } catch { return null }
}

const PUBLIC_PATHS = ['/login', '/register', '/api/auth/login', '/api/auth/register']
const ADMIN_PATHS  = ['/admin', '/api/admin']
// Pages only regular users can access (admins are redirected away)
const USER_ONLY_PATHS = ['/expenses', '/analytics', '/budget']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const token   = request.cookies.get('spendly_token')?.value
  const session = token ? await verifyToken(token) : null

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Block non-admins from admin paths
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && session.role !== 'ADMIN') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Block admins from user-only paths
  if (USER_ONLY_PATHS.some((p) => pathname.startsWith(p)) && session.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Strip any client-supplied identity headers before setting verified ones
  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete('x-user-id')
  requestHeaders.delete('x-user-role')
  requestHeaders.set('x-user-id',   String(session.userId))
  requestHeaders.set('x-user-role', session.role)
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
