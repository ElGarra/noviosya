import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { WEDDING_CTX_COOKIE } from '@/lib/weddingContext'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = body ? z.object({ weddingId: z.string().min(1) }).safeParse(body) : { success: false as const }
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  // Verify wedding exists
  const wedding = await prisma.wedding.findUnique({ where: { id: parsed.data.weddingId } })
  if (!wedding)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(WEDDING_CTX_COOKIE, parsed.data.weddingId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return res
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = NextResponse.json({ ok: true })
  res.cookies.delete(WEDDING_CTX_COOKIE)
  return res
}
