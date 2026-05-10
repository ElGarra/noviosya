import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AccountForm from './AccountForm'

export default async function AdminAccountPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/couple/login')

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-xl mx-auto">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Administración</p>
        <h1 className="font-serif italic text-3xl text-text-base mb-8">Mi cuenta</h1>
        <AccountForm name={session.user.name ?? ''} email={session.user.email ?? ''} />
      </div>
    </main>
  )
}
