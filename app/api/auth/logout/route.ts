import { NextResponse }       from 'next/server'
import { clearAuthCookie, getUserFromHeaders } from '@/lib/auth'

export async function POST(request: Request) {
  if (!getUserFromHeaders(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = NextResponse.json({ success: true })
  clearAuthCookie(response)
  return response
}
