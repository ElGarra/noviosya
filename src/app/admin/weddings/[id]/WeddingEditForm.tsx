'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DateMode = 'none' | 'date' | 'datetime'

function parseDateMode(iso: string | null): { mode: DateMode; dateOnly: string; dateTime: string } {
  if (!iso) return { mode: 'none', dateOnly: '', dateTime: '' }
  const d = new Date(iso)
  const isNoon = d.getUTCHours() === 12 && d.getUTCMinutes() === 0
  return {
    mode:     isNoon ? 'date' : 'datetime',
    dateOnly: d.toISOString().slice(0, 10),
    dateTime: d.toISOString().slice(0, 16),
  }
}

interface Props {
  weddingId:    string
  partner1Name: string
  partner2Name: string
  weddingDate:  string | null
  venueName:    string | null
  venueAddress: string | null
  venueMapsUrl: string | null
  dressCode:    string | null
}

export function WeddingEditForm({
  weddingId, partner1Name, partner2Name, weddingDate,
  venueName, venueAddress, venueMapsUrl, dressCode,
}: Props) {
  const router = useRouter()
  const parsed = parseDateMode(weddingDate)

  const [form, setForm] = useState({
    partner1Name: partner1Name,
    partner2Name: partner2Name,
    venueName:    venueName    ?? '',
    venueAddress: venueAddress ?? '',
    venueMapsUrl: venueMapsUrl ?? '',
    dressCode:    dressCode    ?? '',
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

    const res = await fetch(`/api/admin/weddings/${weddingId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        venueName:    form.venueName    || undefined,
        venueAddress: form.venueAddress || undefined,
        venueMapsUrl: form.venueMapsUrl || '',
        dressCode:    form.dressCode    || undefined,
        weddingDate:  buildWeddingDate(),
      }),
    })

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } else {
      setError('Error al guardar')
    }
    setLoading(false)
  }

  const inputClass = 'w-full border border-gold/30 px-3 py-2.5 text-sm focus:outline-none focus:border-gold bg-white'
  const labelClass = 'block text-[0.65rem] tracking-[0.2em] uppercase text-text-muted mb-1.5'

  const dateModes: { key: DateMode; label: string }[] = [
    { key: 'none',     label: 'Sin confirmar' },
    { key: 'date',     label: 'Solo fecha' },
    { key: 'datetime', label: 'Fecha y hora' },
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm p-6 space-y-5">
      <p className="text-[0.65rem] tracking-[0.2em] uppercase text-text-muted">Datos de la boda</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Novio/a 1 *</label>
          <input className={inputClass} required value={form.partner1Name}
            onChange={e => setForm(f => ({ ...f, partner1Name: e.target.value }))} />
        </div>
        <div>
          <label className={labelClass}>Novio/a 2 *</label>
          <input className={inputClass} required value={form.partner2Name}
            onChange={e => setForm(f => ({ ...f, partner2Name: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Fecha</label>
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
        <label className={labelClass}>Venue</label>
        <input className={inputClass} value={form.venueName}
          onChange={e => setForm(f => ({ ...f, venueName: e.target.value }))}
          placeholder="Casona San Ignacio" />
      </div>
      <div>
        <label className={labelClass}>Dirección</label>
        <input className={inputClass} value={form.venueAddress}
          onChange={e => setForm(f => ({ ...f, venueAddress: e.target.value }))}
          placeholder="Caupolicán 8611, Quilicura" />
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
          placeholder="Formal" />
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button type="submit" disabled={loading}
          className="bg-gold text-white px-6 py-2.5 text-sm tracking-wide hover:opacity-90 disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved  && <span className="text-green-600 text-sm">✓ Guardado</span>}
        {error  && <span className="text-red-500 text-sm">{error}</span>}
      </div>
    </form>
  )
}
