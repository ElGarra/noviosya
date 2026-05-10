import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEffectiveWeddingId } from '@/lib/weddingContext'
import { GuestCRM } from './GuestCRM'

export default async function GuestsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/couple/login')

  const weddingId = await getEffectiveWeddingId(session)
  if (!weddingId) redirect('/admin/dashboard')

  const guests = await prisma.guest.findMany({
    where: { weddingId },
    include: { rsvp: true },
    orderBy: { lastName: 'asc' },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const data = guests.map((g) => ({
    id:            g.id,
    firstName:     g.firstName,
    lastName:      g.lastName,
    email:         g.email,
    maxCompanions: g.maxCompanions,
    table:         g.table,
    notes:         g.notes,
    inviteSentAt:  g.inviteSentAt?.toISOString() ?? null,
    token:         g.token,
    rsvpUrl:       `${appUrl}/i/${g.token}`,
    status:        g.rsvp?.status ?? 'PENDING',
    companions:    (g.rsvp?.companions ?? []) as { firstName: string; lastName: string; dietaryRestrictions?: string }[],
    dietaryRestrictions: g.rsvp?.dietaryRestrictions ?? null,
    message:       g.rsvp?.message ?? null,
  }))

  return (
    <div>
      <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Gestión</p>
      <h1 className="font-serif italic text-3xl text-text-base mb-6">Invitados</h1>
      <GuestCRM guests={data} />
    </div>
  )
}
