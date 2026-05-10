import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveWeddingIdFromReq } from '@/lib/weddingContext'

type Params = { params: Promise<{ id: string }> }

const PatchSchema = z.object({
  firstName:     z.string().min(1).max(100).optional(),
  lastName:      z.string().min(1).max(100).optional(),
  email:         z.string().email().optional().or(z.literal('')),
  maxCompanions: z.coerce.number().min(0).max(10).optional(),
  table:         z.string().max(50).optional().or(z.literal('')),
  notes:         z.string().max(500).optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const weddingId = getEffectiveWeddingIdFromReq(req, session)
  const guest = await prisma.guest.findFirst({ where: { id, weddingId } })
  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { email, table, ...rest } = parsed.data
  const updated = await prisma.guest.update({
    where: { id },
    data: {
      ...rest,
      email: email !== undefined ? (email || null) : undefined,
      table: table !== undefined ? (table || null)  : undefined,
    },
  })
  return NextResponse.json({ guest: updated })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const weddingId = getEffectiveWeddingIdFromReq(req, session)
  await prisma.guest.deleteMany({ where: { id, weddingId } })
  return NextResponse.json({ ok: true })
}
