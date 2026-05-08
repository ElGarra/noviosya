'use client'

import { useState } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'COUPLE'
  createdAt: Date
}

export function UserManager({ users: initial }: { users: User[] }) {
  const [users, setUsers]     = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'COUPLE' as 'ADMIN' | 'COUPLE' })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setUsers([...users, data.user])
      setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'COUPLE' })
    } else {
      setError(data.error ?? 'Error al crear usuario')
    }
    setLoading(false)
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`¿Eliminar a ${email}?`)) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setUsers(users.filter((u) => u.id !== id))
  }

  const roleLabel = { ADMIN: 'Admin', COUPLE: 'Novio/a' }
  const roleBadge = { ADMIN: 'bg-text-base text-white', COUPLE: 'bg-amber-50 text-gold border border-gold/20' }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-text-muted text-sm">{users.length} usuarios</p>
        <button onClick={() => setShowForm(true)}
          className="bg-gold text-white px-5 py-2 text-sm hover:opacity-90">
          + Crear usuario
        </button>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-sm p-8 shadow-xl">
            <h2 className="font-serif italic text-xl text-text-base mb-6">Nuevo usuario</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input placeholder="Nombre" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
              <input type="email" placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
              <input type="password" placeholder="Contraseña temporal (mín. 8 chars, 1 mayúscula, 1 número)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required
                className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
              <div>
                <label className="block text-[0.65rem] tracking-widest uppercase text-text-muted mb-1">Rol</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'ADMIN' | 'COUPLE' })}
                  className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold">
                  <option value="COUPLE">Novio/a</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gold text-white py-2.5 text-sm disabled:opacity-50">
                  {loading ? 'Creando...' : 'Crear'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setError(null) }}
                  className="flex-1 border border-gold/40 text-text-muted py-2.5 text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User list */}
      <div className="bg-white shadow-sm">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between px-6 py-4 border-b border-gold/10 last:border-0">
            <div>
              <p className="font-medium text-text-base text-sm">{user.name ?? '—'}</p>
              <p className="text-text-muted text-xs">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleBadge[user.role]}`}>
                {roleLabel[user.role]}
              </span>
              <button onClick={() => handleDelete(user.id, user.email)}
                className="text-xs text-red-400 hover:text-red-600">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
