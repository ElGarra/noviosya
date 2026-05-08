import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PasswordSchema, BCRYPT_ROUNDS } from '@/lib/password'

const Schema = z.object({
  name:     z.string().min(1).max(100),
  email:    z.string().email(),
  password: PasswordSchema,
  role:     z.enum(['ADMIN', 'COUPLE']).default('COUPLE'),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { name, email, password, role } = parsed.data

  const existing = await prisma.weddingAdmin.findUnique({
    where: { weddingId_email: { weddingId: session.user.weddingId, email } },
  })
  if (existing) return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const user = await prisma.weddingAdmin.create({
    data: { weddingId: session.user.weddingId, email, passwordHash, name, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  return NextResponse.json({ user }, { status: 201 })
}
