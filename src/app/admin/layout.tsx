import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { SessionProvider } from './SessionProvider'
import { LogoutButton } from '@/components/LogoutButton'

const NAV = [
  { href: '/admin/dashboard', label: 'Bodas' },
  { href: '/admin/account',   label: 'Mi cuenta' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  return (
    <SessionProvider>
      <header className="bg-white border-b border-gold/20 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <Link href="/admin/dashboard" className="font-serif italic text-gold text-lg tracking-wide">
            noviosya
          </Link>
          <nav className="hidden sm:flex gap-5">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-xs tracking-[0.15em] uppercase text-text-muted hover:text-gold transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted hidden md:block">{session.user.email}</span>
          <LogoutButton className="text-xs tracking-[0.15em] uppercase text-text-muted hover:text-gold transition-colors" />
        </div>
      </header>
      {children}
    </SessionProvider>
  )
}
