import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export type JWTPayload = { userId: number; role: 'ADMIN' | 'USER' }

const COOKIE_NAME = 'spendly_token'
const EXPIRY      = '7d'

function secret() {
  return new TextEncoder().encode(process.env.JWT_SECRET!)
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return { userId: payload.userId as number, role: payload.role as 'ADMIN' | 'USER' }
  } catch {
    return null
  }
}

export async function getSession(request: Request | NextRequest): Promise<JWTPayload | null> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  return verifyToken(decodeURIComponent(match[1]))
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
  })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
    maxAge:   0,
  })
}
