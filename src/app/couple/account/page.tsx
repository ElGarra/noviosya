'use client'

import { useState } from 'react'

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

export default function AccountPage() {
  const [current, setCurrent]  = useState('')
  const [newPass, setNewPass]  = useState('')
  const [confirm, setConfirm]  = useState('')
  const [loading, setLoading]  = useState(false)
  const [success, setSuccess]  = useState(false)
  const [error, setError]      = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPass !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
    })

    if (res.ok) {
      setSuccess(true)
      setCurrent(''); setNewPass(''); setConfirm('')
      setTimeout(() => setSuccess(false), 4000)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Error inesperado')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-1">Mi cuenta</p>
      <h1 className="font-serif italic text-3xl text-text-base mb-8">Cambiar contraseña</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-sm space-y-5">
        <div>
          <label className="block text-[0.65rem] tracking-widest uppercase text-text-muted mb-1.5">
            Contraseña actual
          </label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required
            className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
        </div>

        <div>
          <label className="block text-[0.65rem] tracking-widest uppercase text-text-muted mb-1.5">
            Nueva contraseña
          </label>
          <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required
            className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
          <PasswordRules password={newPass} />
        </div>

        <div>
          <label className="block text-[0.65rem] tracking-widest uppercase text-text-muted mb-1.5">
            Confirmar nueva contraseña
          </label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
            className="w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold" />
        </div>

        {error   && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">✓ Contraseña actualizada</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-gold text-white py-3 text-sm tracking-[0.15em] uppercase disabled:opacity-50">
          {loading ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
