import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { generateToken } from '@/lib/tokens'
import { GuestCreateSchema } from '@/schemas/guest'
import { getEffectiveWeddingIdFromReq } from '@/lib/weddingContext'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weddingId = getEffectiveWeddingIdFromReq(req, session)
  const guests = await prisma.guest.findMany({
    where: { weddingId },
    include: { rsvp: { select: { status: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ guests })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = GuestCreateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid data', issues: parsed.error.issues }, { status: 400 })

  const weddingId = getEffectiveWeddingIdFromReq(req, session)
  const { firstName, lastName, email, phone, maxCompanions, group, notes } = parsed.data

  const guest = await prisma.guest.create({
    data: {
      weddingId,
      token: generateToken(),
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      maxCompanions,
      group: group || null,
      notes: notes || null,
    },
  })

  return NextResponse.json({ guest }, { status: 201 })
}
