import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SwitchWeddingButton } from './SwitchWeddingButton'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/couple/login')

  const weddings = await prisma.wedding.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { guests: true } },
      admins: { select: { name: true, role: true } },
    },
  })

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Panel de administración</p>
            <h1 className="font-serif italic text-3xl text-text-base">Bodas</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/account"
              className="border border-gold/30 text-text-muted px-4 py-2.5 text-sm hover:border-gold hover:text-gold transition-colors whitespace-nowrap">
              Mi cuenta
            </Link>
            <Link href="/admin/weddings/new"
              className="bg-gold text-white px-5 py-2.5 text-sm tracking-wide hover:opacity-90 transition-opacity whitespace-nowrap">
              + Nueva boda
            </Link>
          </div>
        </div>

        {/* Lista de bodas */}
        {weddings.length === 0 ? (
          <div className="bg-white shadow-sm p-12 text-center">
            <p className="text-text-muted text-sm">No hay bodas todavía.</p>
            <Link href="/admin/weddings/new"
              className="inline-block mt-4 text-gold text-sm hover:opacity-70 transition-opacity">
              Crear la primera →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {weddings.map((w) => {
              const dateStr = w.weddingDate
                ? w.weddingDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: w.timezone })
                : null
              const coupleMembers = w.admins.filter(a => a.role === 'COUPLE').map(a => a.name).filter(Boolean)

              return (
                <div key={w.id} className="bg-white shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="font-serif italic text-xl text-text-base">
                        {w.partner1Name} &amp; {w.partner2Name}
                      </h2>
                      <p className="text-text-muted text-xs">
                        {dateStr ?? 'Fecha por confirmar'}
                        {w.venueName && ` · ${w.venueName}`}
                      </p>
                      <p className="text-text-muted text-xs">
                        /{w.slug}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                      <Link href={`/${w.slug}`} target="_blank"
                        className="text-xs border border-gold/30 text-text-muted px-3 py-1.5 hover:border-gold hover:text-gold transition-colors">
                        Ver ↗
                      </Link>
                      <Link href={`/admin/weddings/${w.id}`}
                        className="text-xs border border-gold/30 text-text-muted px-3 py-1.5 hover:border-gold hover:text-gold transition-colors">
                        Configurar
                      </Link>
                      <SwitchWeddingButton weddingId={w.id} />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-6 text-xs text-text-muted">
                    <span>{w._count.guests} invitados</span>
                    <span className={w.rsvpEnabled ? 'text-green-600' : ''}>
                      RSVP {w.rsvpEnabled ? 'activo' : 'inactivo'}
                    </span>
                    <span className={w.giftsEnabled ? 'text-green-600' : ''}>
                      Regalos {w.giftsEnabled ? 'activo' : 'inactivo'}
                    </span>
                    {coupleMembers.length > 0 && (
                      <span>{coupleMembers.join(', ')}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}


      </div>
    </main>
  )
}
