import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { PasswordSchema, BCRYPT_ROUNDS } from '@/lib/password'

const Schema = z.object({
  token:       z.string().min(1),
  newPassword: PasswordSchema,
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { token, newPassword } = parsed.data

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { admin: true },
  })

  if (!record || record.usedAt || record.expiresAt < new Date())
    return NextResponse.json({ error: 'Link inválido o expirado' }, { status: 400 })

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  await prisma.$transaction([
    prisma.weddingAdmin.update({
      where: { id: record.adminId },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return NextResponse.json({ ok: true })
}
