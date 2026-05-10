'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SwitchWeddingButton({ weddingId }: { weddingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    await fetch('/api/admin/switch-wedding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId }),
    })
    router.push('/couple/dashboard')
    router.refresh()
  }

  return (
    <button onClick={handle} disabled={loading}
      className="text-xs border border-gold/30 text-text-muted px-3 py-1.5 hover:border-gold hover:text-gold transition-colors disabled:opacity-50 whitespace-nowrap">
      {loading ? '...' : 'Gestionar →'}
    </button>
  )
}
