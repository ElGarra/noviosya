import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { Session } from 'next-auth'

export const WEDDING_CTX_COOKIE = 'noviosya-wedding-ctx'

// For server components
export async function getEffectiveWeddingId(session: Session): Promise<string | null> {
  if (session.user.role === 'ADMIN') {
    const store = await cookies()
    const ctx = store.get(WEDDING_CTX_COOKIE)
    if (ctx?.value) return ctx.value
    return null
  }
  return session.user.weddingId
}

// For API route handlers (NextRequest)
export function getEffectiveWeddingIdFromReq(req: NextRequest, session: Session): string | null {
  if (session.user.role === 'ADMIN') {
    const ctx = req.cookies.get(WEDDING_CTX_COOKIE)
    if (ctx?.value) return ctx.value
    return null
  }
  return session.user.weddingId
}
