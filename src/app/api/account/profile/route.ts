import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const Schema = z.object({
  name: z.string().min(1, 'El nombre no puede estar vacío').max(100),
})

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  await prisma.weddingAdmin.update({
    where: { id: session.user.id },
    data:  { name: parsed.data.name },
  })

  return NextResponse.json({ ok: true })
}
