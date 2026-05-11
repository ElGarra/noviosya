import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionProvider } from '@/app/admin/SessionProvider'
import { WEDDING_CTX_COOKIE } from '@/lib/weddingContext'
import { AdminBanner } from './AdminBanner'
import { LogoutButton } from '@/components/LogoutButton'

const BASE_NAV = [
  { href: '/couple/dashboard', label: 'Inicio',       feature: null },
  { href: '/couple/wedding',   label: 'Nuestra boda', feature: null },
  { href: '/couple/guests',    label: 'Invitados',    feature: null },
  { href: '/couple/gifts',     label: 'Regalos',      feature: 'gifts' },
  { href: '/couple/account',   label: 'Mi cuenta',    feature: null },
]

export default async function CoupleLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) return <SessionProvider>{children}</SessionProvider>

  const cookieStore = await cookies()
  const ctxWeddingId = session.user.role === 'ADMIN'
    ? cookieStore.get(WEDDING_CTX_COOKIE)?.value ?? null
    : null

  // Admin without context switch has no wedding to manage here
  if (session.user.role === 'ADMIN' && !ctxWeddingId) redirect('/admin/dashboard')

  const effectiveWeddingId = ctxWeddingId ?? session.user.weddingId ?? ''

  const wedding = await prisma.wedding.findUnique({
    where: { id: effectiveWeddingId },
    select: { giftsEnabled: true, rsvpEnabled: true, partner1Name: true, partner2Name: true },
  })

  const features = { gifts: wedding?.giftsEnabled ?? true, rsvp: wedding?.rsvpEnabled ?? true }
  const nav = BASE_NAV.filter(({ feature }) =>
    !feature || features[feature as keyof typeof features]
  )

  return (
    <SessionProvider>
      <div className="min-h-svh flex flex-col bg-cream">
        {ctxWeddingId && wedding && (
          <AdminBanner
            partner1={wedding.partner1Name}
            partner2={wedding.partner2Name}
          />
        )}
        <header className="bg-white border-b border-gold/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-serif italic text-gold text-lg">
              {ctxWeddingId
                ? `${wedding?.partner1Name} & ${wedding?.partner2Name}`
                : (session.user.name ?? 'Panel')}
            </span>
            <nav className="hidden sm:flex gap-4">
              {nav.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="text-xs tracking-[0.15em] uppercase text-text-muted hover:text-gold transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {!ctxWeddingId && (
              <Link href="/" className="text-xs text-text-muted hover:text-gold">Ver landing</Link>
            )}
            {session.user.role === 'ADMIN' && !ctxWeddingId && (
              <Link href="/admin/dashboard"
                className="text-xs bg-text-base text-white px-3 py-1.5 hover:opacity-80">
                Admin
              </Link>
            )}
            <LogoutButton className="text-xs tracking-[0.15em] uppercase text-text-muted hover:text-gold transition-colors" />
          </div>
        </header>
        <main className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
