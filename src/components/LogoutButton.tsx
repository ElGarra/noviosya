'use client'

import { signOut } from 'next-auth/react'

interface Props {
  className?: string
  label?: string
}

export function LogoutButton({ className, label = 'Cerrar sesión' }: Props) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className={className}
    >
      {label}
    </button>
  )
}
