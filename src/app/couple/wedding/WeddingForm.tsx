'use client'

import { useState } from 'react'
import type { Wedding } from '@prisma/client'

type DateMode = 'none' | 'date' | 'datetime'

function parseDateMode(date: Date | null): { mode: DateMode; dateOnly: string; dateTime: string } {
  if (!date) return { mode: 'none', dateOnly: '', dateTime: '' }
  const iso = date instanceof Date ? date.toISOString() : new Date(date).toISOString()
  const d = new Date(iso)
  const isNoon = d.getUTCHours() === 12 && d.getUTCMinutes() === 0
  return {
    mode:     isNoon ? 'date' : 'datetime',
    dateOnly: iso.slice(0, 10),
    dateTime: iso.slice(0, 16),
  }
}

export function WeddingForm({ wedding }: { wedding: Wedding }) {
  const parsed = parseDateMode(wedding.weddingDate)

  const [form, setForm] = useState({
    partner1Name:  wedding.partner1Name,
    partner2Name:  wedding.partner2Name,
    venueName:     wedding.venueName ?? '',
    venueAddress:  wedding.venueAddress ?? '',
    venueMapsUrl:  wedding.venueMapsUrl ?? '',
    dressCode:     wedding.dressCode ?? '',
  })
  const [dateMode, setDateMode] = useState<DateMode>(parsed.mode)
  const [dateOnly, setDateOnly] = useState(parsed.dateOnly)
  const [dateTime, setDateTime] = useState(parsed.dateTime)
  const [loading, setLoading]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  function buildWeddingDate(): string | null {
    if (dateMode === 'none') return null
    if (dateMode === 'date')     return dateOnly ? `${dateOnly}T12:00:00.000Z` : null
    if (dateMode === 'datetime') return dateTime ? new Date(dateTime).toISOString() : null
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    setError(null)
    const res = await fetch('/api/couple/wedding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, weddingDate: buildWeddingDate() }),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else setError('Error al guardar')
    setLoading(false)
  }

  const inputClass = 'w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold'
  const labelClass = 'block text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-1.5'

  const dateModes: { key: DateMode; label: string }[] = [
    { key: 'none',     label: 'Sin confirmar' },
    { key: 'date',     label: 'Solo fecha' },
    { key: 'datetime', label: 'Fecha y hora' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="bg-white p-8 shadow-sm space-y-6">

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Novio/a 1</label>
            <input className={inputClass} value={form.partner1Name}
              onChange={e => setForm(f => ({ ...f, partner1Name: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Novio/a 2</label>
            <input className={inputClass} value={form.partner2Name}
              onChange={e => setForm(f => ({ ...f, partner2Name: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Fecha de la ceremonia</label>
          <div className="flex gap-1 mb-2">
            {dateModes.map(({ key, label }) => (
              <button key={key} type="button"
                onClick={() => setDateMode(key)}
                className={`text-[0.65rem] tracking-[0.1em] uppercase px-3 py-1.5 border transition-colors ${
                  dateMode === key
                    ? 'border-gold bg-gold text-white'
                    : 'border-gold/30 text-text-muted hover:border-gold hover:text-gold'
                }`}>
                {label}
              </button>
            ))}
          </div>
          {dateMode === 'date' && (
            <input type="date" className={inputClass} value={dateOnly}
              onChange={e => setDateOnly(e.target.value)} />
          )}
          {dateMode === 'datetime' && (
            <input type="datetime-local" className={inputClass} value={dateTime}
              onChange={e => setDateTime(e.target.value)} />
          )}
        </div>

        <div>
          <label className={labelClass}>Nombre del venue</label>
          <input className={inputClass} value={form.venueName}
            onChange={e => setForm(f => ({ ...f, venueName: e.target.value }))}
            placeholder="Ej. Casa de Campo, Hotel..." />
        </div>
        <div>
          <label className={labelClass}>Dirección</label>
          <input className={inputClass} value={form.venueAddress}
            onChange={e => setForm(f => ({ ...f, venueAddress: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Link Google Maps</label>
          <input type="url" className={inputClass} value={form.venueMapsUrl}
            onChange={e => setForm(f => ({ ...f, venueMapsUrl: e.target.value }))}
            placeholder="https://maps.google.com/..." />
        </div>
        <div>
          <label className={labelClass}>Dress code</label>
          <input className={inputClass} value={form.dressCode}
            onChange={e => setForm(f => ({ ...f, dressCode: e.target.value }))}
            placeholder="Ej. Formal, Semi-formal..." />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={loading}
          className="bg-gold text-white px-8 py-2.5 text-sm tracking-[0.15em] uppercase disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && <span className="text-green-600 text-sm">✓ Guardado</span>}
        {error && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </form>
  )
}
