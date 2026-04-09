import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getSession }   from '@/lib/auth'
import { SAFE_USER_SELECT } from '@/lib/auth.server'

export async function GET(request: Request) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: SAFE_USER_SELECT })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ user })
}
