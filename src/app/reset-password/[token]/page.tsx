'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

function PasswordRules({ password }: { password: string }) {
  const rules = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Al menos una mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Al menos un número',    ok: /[0-9]/.test(password) },
  ]
  return (
    <ul className="mt-2 space-y-1">
      {rules.map(({ label, ok }) => (
        <li key={label} className={`text-xs flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-text-muted'}`}>
          <span>{ok ? '✓' : '○'}</span> {label}
        </li>
      ))}
    </ul>
  )
}

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/account/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: password }),
    })

    if (res.ok) {
      router.push('/couple/login?reset=1')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error inesperado')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-svh bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-10 shadow-sm">
        <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-2">Seguridad</p>
        <h1 className="font-serif italic text-2xl text-text-base mb-6">Nueva contraseña</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input type="password" placeholder="Nueva contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
            <PasswordRules password={password} />
          </div>
          <input type="password" placeholder="Confirmar contraseña" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} required
            className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-gold text-white py-3 text-sm tracking-[0.15em] uppercase disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </main>
  )
}
