'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

function PasswordRules({ password }: { password: string }) {
  const rules = [
    { label: 'Mínimo 8 caracteres',   ok: password.length >= 8 },
    { label: 'Al menos una mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Al menos un número',     ok: /[0-9]/.test(password) },
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

export default function AccountForm({ name: initialName, email }: { name: string; email: string }) {
  const { update } = useSession()

  const [name, setName]           = useState(initialName)
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved]   = useState(false)
  const [nameError, setNameError]   = useState<string | null>(null)

  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNameSaving(true)
    setNameError(null)

    const res = await fetch('/api/account/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (res.ok) {
      await update({ name })
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 3000)
    } else {
      const data = await res.json()
      setNameError(data.error ?? 'Error al guardar')
    }
    setNameSaving(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPass !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true); setError(null)

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

  const input = 'w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold bg-white'
  const labelCls = 'block text-[0.65rem] tracking-widest uppercase text-text-muted mb-1.5'

  return (
    <div className="space-y-6">

      {/* Nombre */}
      <form onSubmit={handleNameSubmit} className="bg-white shadow-sm p-6 space-y-4">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">Perfil</p>
        <div>
          <label className={labelCls}>Nombre</label>
          <input value={name} onChange={e => setName(e.target.value)} required
            className={input} placeholder="Tu nombre" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input value={email} disabled
            className={`${input} opacity-50 cursor-not-allowed bg-cream`} />
        </div>
        {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={nameSaving}
            className="bg-gold text-white px-6 py-2.5 text-sm tracking-wide hover:opacity-90 disabled:opacity-50">
            {nameSaving ? 'Guardando...' : 'Guardar nombre'}
          </button>
          {nameSaved && <span className="text-green-600 text-sm">✓ Guardado</span>}
        </div>
      </form>

      {/* Contraseña */}
      <form onSubmit={handlePasswordSubmit} className="bg-white shadow-sm p-6 space-y-5">
        <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">Cambiar contraseña</p>

        <div>
          <label className={labelCls}>Contraseña actual</label>
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)}
            required className={input} />
        </div>
        <div>
          <label className={labelCls}>Nueva contraseña</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)}
            required className={input} />
          <PasswordRules password={newPass} />
        </div>
        <div>
          <label className={labelCls}>Confirmar nueva contraseña</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            required className={input} />
        </div>

        {error   && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">✓ Contraseña actualizada</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-gold text-white py-3 text-sm tracking-[0.15em] uppercase disabled:opacity-50 hover:opacity-90 transition-opacity">
          {loading ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </form>

    </div>
  )
}
