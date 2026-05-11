import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveWeddingId } from '@/lib/weddingContext'
import { GiftManager } from './GiftManager'

export default async function GiftsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const weddingId = await getEffectiveWeddingId(session)
  if (!weddingId) redirect('/admin/dashboard')

  const gifts = await prisma.giftItem.findMany({
    where: { weddingId },
    include: {
      reservations: {
        include: { guest: { select: { firstName: true, lastName: true, email: true } } },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  const serialized = gifts.map((g) => ({
    ...g,
    price: g.price ? Number(g.price) : null,
  }))

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Lista</p>
      <h1 className="font-serif italic text-3xl text-text-base mb-8">Regalos</h1>
      <GiftManager gifts={serialized} weddingId={weddingId} />
    </div>
  )
}
