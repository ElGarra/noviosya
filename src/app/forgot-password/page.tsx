'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/account/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-svh bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-10 shadow-sm">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-2">Seguridad</p>
        <h1 className="font-serif italic text-2xl text-text-base mb-6">Olvidé mi contraseña</h1>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-green-600 mb-2">✓ Email enviado</p>
            <p className="text-text-muted text-sm">
              Si tu email está registrado, recibirás un link para restablecer tu contraseña.
              Revisá tu bandeja de entrada (y spam).
            </p>
            <Link href="/couple/login" className="block mt-6 text-gold text-sm underline">
              Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-text-muted text-sm">
              Ingresá tu email y te mandamos un link para restablecer tu contraseña.
            </p>
            <input type="email" placeholder="tu@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
            <button type="submit" disabled={loading}
              className="w-full bg-gold text-white py-3 text-sm tracking-[0.15em] uppercase disabled:opacity-50">
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
            <Link href="/couple/login" className="block text-center text-text-muted text-xs hover:text-gold">
              Volver al login
            </Link>
          </form>
        )}
      </div>
    </main>
  )
}
