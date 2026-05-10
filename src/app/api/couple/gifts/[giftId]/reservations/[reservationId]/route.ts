import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveWeddingIdFromReq } from '@/lib/weddingContext'

type Params = { params: Promise<{ giftId: string; reservationId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const weddingId = getEffectiveWeddingIdFromReq(req, session)
  if (!weddingId) return NextResponse.json({ error: 'No wedding context' }, { status: 403 })

  const { giftId, reservationId } = await params

  const body = await req.json().catch(() => null)
  if (body === null || typeof body.isConfirmed !== 'boolean')
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const gift = await prisma.giftItem.findFirst({ where: { id: giftId, weddingId } })
  if (!gift) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const reservation = await prisma.giftReservation.update({
    where: { id: reservationId, giftId },
    data:  { isConfirmed: body.isConfirmed },
  })
  return NextResponse.json({ reservation })
}
