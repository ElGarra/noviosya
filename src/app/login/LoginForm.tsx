'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm({ wasReset }: { wasReset: boolean }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', { email, password, redirect: false })

    if (res?.ok) {
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      router.push(session?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/couple/dashboard')
    } else {
      const msg = res?.error?.startsWith('RATE_LIMITED')
        ? 'Demasiados intentos. Esperá 15 minutos.'
        : 'Credenciales incorrectas'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-svh bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-10 shadow-sm">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-2">Bienvenido</p>
        <h1 className="font-serif italic text-2xl text-text-base mb-8">Acceso</h1>

        {wasReset && (
          <p className="text-green-600 text-sm mb-4">✓ Contraseña actualizada. Podés iniciar sesión.</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-white py-3 text-sm tracking-[0.15em] uppercase disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <Link
            href="/forgot-password"
            className="block text-center text-xs text-text-muted hover:text-gold transition-colors"
          >
            Olvidé mi contraseña
          </Link>
        </form>
      </div>
    </main>
  )
}
