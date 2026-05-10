'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AdminBanner({ partner1, partner2 }: { partner1: string; partner2: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function exit() {
    setLoading(true)
    await fetch('/api/admin/switch-wedding', { method: 'DELETE' })
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-text-base text-white px-4 py-2 flex items-center justify-between text-xs">
      <span className="tracking-wide">
        <span className="text-gold font-medium">Admin</span>
        {' · '}Gestionando{' '}
        <span className="font-medium">{partner1} &amp; {partner2}</span>
      </span>
      <button onClick={exit} disabled={loading}
        className="text-white/70 hover:text-white transition-colors disabled:opacity-50">
        {loading ? 'Saliendo...' : '← Volver al admin'}
      </button>
    </div>
  )
}
