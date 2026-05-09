import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FeatureToggles } from './FeatureToggles'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/couple/login')

  const weddingId = session.user.weddingId

  const [wedding, confirmed, declined, pending, total] = await Promise.all([
    prisma.wedding.findUnique({ where: { id: weddingId } }),
    prisma.rSVP.count({ where: { guest: { weddingId }, status: 'CONFIRMED' } }),
    prisma.rSVP.count({ where: { guest: { weddingId }, status: 'DECLINED' } }),
    prisma.guest.count({ where: { weddingId, OR: [{ rsvp: null }, { rsvp: { status: 'PENDING' } }] } }),
    prisma.guest.count({ where: { weddingId } }),
  ])

  if (!wedding) redirect('/admin/login')

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Panel de administración</p>
            <h1 className="font-serif italic text-3xl text-text-base">
              {wedding.partner1Name} &amp; {wedding.partner2Name}
            </h1>
            {wedding.weddingDate && (
              <p className="text-text-muted text-sm mt-1">
                {wedding.weddingDate.toLocaleDateString('es-CL', {
                  day: 'numeric', month: 'long', year: 'numeric', timeZone: wedding.timezone,
                })} · {wedding.venueName ?? 'Venue por confirmar'}
              </p>
            )}
          </div>
          <Link href="/couple/dashboard"
            className="bg-gold text-white px-5 py-2.5 text-sm tracking-wide hover:opacity-90 transition-opacity whitespace-nowrap">
            Entrar como novios →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total invitados', value: total,     color: 'text-text-base' },
            { label: 'Confirmados',     value: confirmed, color: 'text-green-600' },
            { label: 'No asisten',      value: declined,  color: 'text-red-500' },
            { label: 'Sin respuesta',   value: pending,   color: 'text-gold' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white p-5 text-center shadow-sm">
              <p className={`text-4xl font-serif font-light ${color}`}>{value}</p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Feature toggles */}
        <div className="bg-white shadow-sm p-6">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-4">
            Funcionalidades de la boda
          </p>
          <FeatureToggles
            weddingId={weddingId}
            rsvpEnabled={wedding.rsvpEnabled}
            giftsEnabled={wedding.giftsEnabled}
          />
        </div>

        {/* Quick links */}
        <div className="bg-white shadow-sm p-6">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-4">Accesos rápidos</p>
          <div className="flex flex-wrap gap-3">
            {[
              { href: '/couple/guests',   label: 'Invitados' },
              { href: '/couple/gifts',    label: 'Regalos' },
              { href: '/couple/wedding',  label: 'Info de la boda' },
              { href: '/admin/users',     label: 'Usuarios' },
              { href: '/',                label: 'Ver landing' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm border border-gold/30 text-text-muted px-4 py-2 hover:border-gold hover:text-gold transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
