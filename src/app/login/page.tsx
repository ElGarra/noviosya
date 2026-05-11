import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { authOptions } from '@/lib/auth'
import { LoginForm } from './LoginForm'

type Props = { searchParams: Promise<{ reset?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect(session.user.role === 'ADMIN' ? '/admin/dashboard' : '/couple/dashboard')
  }

  const { reset } = await searchParams

  return (
    <Suspense>
      <LoginForm wasReset={reset === '1'} />
    </Suspense>
  )
}
