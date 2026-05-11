'use client'

import { useState, useMemo } from 'react'

type RsvpStatus = 'CONFIRMED' | 'DECLINED' | 'PENDING'

interface Companion { firstName: string; lastName: string; dietaryRestrictions?: string }

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string | null
  maxCompanions: number
  table: string | null
  notes: string | null
  inviteSentAt: string | null
  token: string
  rsvpUrl: string
  status: RsvpStatus
  companions: Companion[]
  dietaryRestrictions: string | null
  message: string | null
}

interface GuestCRMProps {
  guests: Guest[]
  rsvpEnabled: boolean
}

const RSVP_STATUS: Record<RsvpStatus, { label: string; className: string }> = {
  CONFIRMED: { label: 'Confirmó',  className: 'bg-green-50 text-green-700 border-green-200' },
  DECLINED:  { label: 'No asiste', className: 'bg-red-50 text-red-600 border-red-200' },
  PENDING:   { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
}

const RSVP_TABS: { key: RsvpStatus | 'ALL'; label: string }[] = [
  { key: 'ALL',       label: 'Todos' },
  { key: 'CONFIRMED', label: 'Confirmados' },
  { key: 'PENDING',   label: 'Pendientes' },
  { key: 'DECLINED',  label: 'No asisten' },
]

export function GuestCRM({ guests: initial, rsvpEnabled }: GuestCRMProps) {
  const [guests, setGuests]             = useState(initial)
  const [activeTab, setActiveTab]       = useState<RsvpStatus | 'ALL'>('ALL')
  const [search, setSearch]             = useState('')
  const [showAdd, setShowAdd]           = useState(false)
  const [showDiets, setShowDiets]       = useState(false)
  const [editingTable, setEditingTable] = useState<string | null>(null)
  const [tableVal, setTableVal]         = useState('')
  const [loading, setLoading]           = useState(false)
  const [newGuest, setNewGuest]         = useState({
    firstName: '', lastName: '', email: '', maxCompanions: 0, notes: '',
  })

  // ── Derived stats ─────────────────────────────────────────────────────────
  const confirmed   = guests.filter((g) => g.status === 'CONFIRMED')
  const totalPeople = confirmed.reduce((acc, g) => acc + 1 + g.companions.length, 0)

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return guests
      .filter((g) => !rsvpEnabled || activeTab === 'ALL' || g.status === activeTab)
      .filter((g) => {
        if (!search) return true
        const q = search.toLowerCase()
        return `${g.firstName} ${g.lastName} ${g.email ?? ''}`.toLowerCase().includes(q)
      })
  }, [guests, activeTab, search, rsvpEnabled])

  // ── Dietary summary (only relevant when RSVP is active) ───────────────────
  const dietRows = useMemo(() => {
    if (!rsvpEnabled) return []
    const rows: { name: string; restriction: string }[] = []
    for (const g of confirmed) {
      if (g.dietaryRestrictions)
        rows.push({ name: `${g.firstName} ${g.lastName}`, restriction: g.dietaryRestrictions })
      for (const c of g.companions) {
        if (c.dietaryRestrictions)
          rows.push({ name: `${c.firstName} ${c.lastName}`, restriction: c.dietaryRestrictions })
      }
    }
    return rows
  }, [confirmed, rsvpEnabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────────
  async function addGuest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGuest),
    })
    if (res.ok) {
      const data = await res.json()
      setGuests([...guests, {
        ...data.guest,
        rsvpUrl: `${window.location.origin}/i/${data.guest.token}`,
        status: 'PENDING' as RsvpStatus,
        companions: [],
        dietaryRestrictions: null,
        message: null,
        inviteSentAt: null,
        table: null,
      }])
      setShowAdd(false)
      setNewGuest({ firstName: '', lastName: '', email: '', maxCompanions: 0, notes: '' })
    }
    setLoading(false)
  }

  async function deleteGuest(id: string) {
    if (!confirm('¿Eliminar este invitado?')) return
    await fetch(`/api/couple/guests/${id}`, { method: 'DELETE' })
    setGuests(guests.filter((g) => g.id !== id))
  }

  async function saveTable(id: string) {
    await fetch(`/api/couple/guests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: tableVal }),
    })
    setGuests(guests.map((g) => g.id === id ? { ...g, table: tableVal || null } : g))
    setEditingTable(null)
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url)
  }

  const tableColSpan = rsvpEnabled ? 6 : 3

  return (
    <div className="space-y-4">

      {/* ── Stats ── */}
      <div className={`grid gap-3 ${rsvpEnabled ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 max-w-[10rem]'}`}>
        <div className="bg-white p-4 text-center shadow-sm">
          <p className="text-3xl font-serif font-light text-text-base">{guests.length}</p>
          <p className="text-[0.6rem] tracking-[0.2em] uppercase text-text-muted mt-0.5">Invitados</p>
        </div>
        {rsvpEnabled && (
          <>
            <div className="bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-serif font-light text-green-600">{confirmed.length}</p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-text-muted mt-0.5">Confirmados</p>
            </div>
            <div className="bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-serif font-light text-amber-600">
                {guests.filter((g) => g.status === 'PENDING').length}
              </p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-text-muted mt-0.5">Pendientes</p>
            </div>
            <div className="bg-white p-4 text-center shadow-sm">
              <p className="text-3xl font-serif font-light text-gold">{totalPeople}</p>
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-text-muted mt-0.5">Total personas</p>
            </div>
          </>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {rsvpEnabled ? (
          <div className="flex gap-1">
            {RSVP_TABS.map(({ key, label }) => {
              const count = key === 'ALL' ? guests.length : guests.filter((g) => g.status === key).length
              return (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 text-xs tracking-wide rounded-full transition-colors ${
                    activeTab === key ? 'bg-gold text-white' : 'text-text-muted hover:text-gold'
                  }`}>
                  {label} <span className="opacity-70">({count})</span>
                </button>
              )
            })}
          </div>
        ) : <div />}

        <div className="flex gap-2 w-full sm:w-auto">
          <input placeholder="Buscar invitado..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:w-48 border border-gold/30 px-3 py-1.5 text-sm focus:outline-none focus:border-gold" />
          {rsvpEnabled && (
            <button onClick={() => setShowDiets(!showDiets)}
              className={`text-xs px-3 py-1.5 border transition-colors ${
                showDiets ? 'border-gold bg-gold text-white' : 'border-gold/30 text-gold hover:border-gold'
              }`}>
              🥗 Dietas{dietRows.length > 0 && ` (${dietRows.length})`}
            </button>
          )}
          <button onClick={() => setShowAdd(true)}
            className="bg-gold text-white px-4 py-1.5 text-xs tracking-wide hover:opacity-90 whitespace-nowrap">
            + Agregar
          </button>
        </div>
      </div>

      {/* ── Dietary panel — RSVP only ── */}
      {rsvpEnabled && showDiets && (
        <div className="bg-white border border-gold/20 p-5">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-3">
            Restricciones alimentarias — confirmados
          </p>
          {dietRows.length === 0 ? (
            <p className="text-text-muted text-sm italic">Sin restricciones registradas.</p>
          ) : (
            <div className="space-y-1.5">
              {dietRows.map((r, i) => (
                <div key={i} className="flex gap-4 text-sm">
                  <span className="font-medium text-text-base w-40 shrink-0">{r.name}</span>
                  <span className="text-text-muted">{r.restriction}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Guest table ── */}
      <div className="bg-white shadow-sm overflow-x-auto">
        <table className={`w-full text-sm ${rsvpEnabled ? 'min-w-[700px]' : 'min-w-[420px]'}`}>
          <thead>
            <tr className="border-b border-gold/20 text-left">
              {[
                'Nombre',
                ...(rsvpEnabled ? ['Estado', 'Acompañantes', 'Dieta'] : []),
                'Mesa',
                'Acciones',
              ].map((h) => (
                <th key={h} className="px-4 py-3 text-[0.62rem] tracking-[0.2em] uppercase text-text-muted font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((guest) => {
              const status = RSVP_STATUS[guest.status]
              const allDiets = [
                ...(guest.dietaryRestrictions ? [guest.dietaryRestrictions] : []),
                ...guest.companions
                  .filter((c) => c.dietaryRestrictions)
                  .map((c) => c.dietaryRestrictions!),
              ]

              return (
                <tr key={guest.id} className="border-b border-gold/10 hover:bg-cream/30 transition-colors">
                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-base">{guest.firstName} {guest.lastName}</p>
                    {guest.email
                      ? <p className="text-[0.7rem] text-text-muted">{guest.email}</p>
                      : <p className="text-[0.7rem] text-red-400 italic">Sin email</p>}
                    {guest.notes && (
                      <p className="text-[0.68rem] text-gold mt-0.5 italic">📝 {guest.notes}</p>
                    )}
                    {rsvpEnabled && guest.message && (
                      <p className="text-[0.68rem] text-text-muted mt-0.5 italic">💬 &ldquo;{guest.message}&rdquo;</p>
                    )}
                  </td>

                  {/* Estado — RSVP only */}
                  {rsvpEnabled && (
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  )}

                  {/* Acompañantes — RSVP only */}
                  {rsvpEnabled && (
                    <td className="px-4 py-3 text-text-muted">
                      {guest.companions.length > 0 ? (
                        <ul className="space-y-0.5">
                          {guest.companions.map((c, i) => (
                            <li key={i} className="text-xs">{c.firstName} {c.lastName}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-text-muted/50">
                          {guest.maxCompanions > 0 ? `hasta ${guest.maxCompanions}` : '—'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Dieta — RSVP only */}
                  {rsvpEnabled && (
                    <td className="px-4 py-3">
                      {allDiets.length > 0 ? (
                        <ul className="space-y-0.5">
                          {allDiets.map((d, i) => (
                            <li key={i} className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{d}</li>
                          ))}
                        </ul>
                      ) : <span className="text-text-muted/40 text-xs">—</span>}
                    </td>
                  )}

                  {/* Mesa */}
                  <td className="px-4 py-3">
                    {editingTable === guest.id ? (
                      <div className="flex gap-1">
                        <input value={tableVal} onChange={(e) => setTableVal(e.target.value)}
                          placeholder="Nº mesa"
                          className="w-16 border border-gold/40 px-2 py-1 text-xs focus:outline-none focus:border-gold"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTable(guest.id)
                            if (e.key === 'Escape') setEditingTable(null)
                          }}
                          autoFocus />
                        <button onClick={() => saveTable(guest.id)}
                          className="text-gold text-xs hover:text-gold/70">✓</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingTable(guest.id); setTableVal(guest.table ?? '') }}
                        className="text-xs text-text-muted hover:text-gold transition-colors">
                        {guest.table ?? <span className="italic opacity-40">asignar</span>}
                      </button>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => copyLink(guest.rsvpUrl)}
                        title="Copiar link personal"
                        className="text-xs text-gold border border-gold/30 px-2 py-1 hover:bg-gold hover:text-white transition-colors">
                        Link
                      </button>
                      <a href={guest.rsvpUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-text-muted hover:text-gold">
                        ↗
                      </a>
                      <button onClick={() => deleteGuest(guest.id)}
                        className="text-xs text-red-400 hover:text-red-600 ml-1">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={tableColSpan} className="px-4 py-10 text-center text-text-muted italic text-sm">
                  {search ? `Sin resultados para "${search}"` : 'No hay invitados aún.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add guest modal ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-sm p-8 shadow-xl">
            <h2 className="font-serif italic text-xl text-text-base mb-6">Nuevo invitado</h2>
            <form onSubmit={addGuest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Nombre" value={newGuest.firstName}
                  onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                  className="border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
                <input required placeholder="Apellido" value={newGuest.lastName}
                  onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                  className="border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
              </div>
              <input type="email" placeholder="Email (opcional)" value={newGuest.email}
                onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold" />
              <div>
                <label className="block text-[0.62rem] tracking-widest uppercase text-text-muted mb-1">
                  Acompañantes permitidos
                </label>
                <select value={newGuest.maxCompanions}
                  onChange={(e) => setNewGuest({ ...newGuest, maxCompanions: Number(e.target.value) })}
                  className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? 'Sin acompañantes' : `Hasta ${n} acompañante${n > 1 ? 's' : ''}`}
                    </option>
                  ))}
                </select>
              </div>
              <textarea placeholder="Nota interna (opcional)" value={newGuest.notes}
                onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                rows={2} maxLength={500}
                className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-gold resize-none" />
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gold text-white py-2.5 text-sm disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Agregar'}
                </button>
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 border border-gold/40 text-text-muted py-2.5 text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
