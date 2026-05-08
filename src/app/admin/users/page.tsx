import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserManager } from './UserManager'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/couple/dashboard')

  const users = await prisma.weddingAdmin.findMany({
    where: { weddingId: session.user.weddingId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <main className="min-h-svh bg-cream px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Admin</p>
        <h1 className="font-serif italic text-3xl text-text-base mb-8">Usuarios</h1>
        <UserManager users={users} />
      </div>
    </main>
  )
}
