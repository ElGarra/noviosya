import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email    = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_SEED_PASSWORD
  const name     = process.env.ADMIN_NAME ?? 'Admin'

  if (!email || !password)
    throw new Error('Required: ADMIN_EMAIL and ADMIN_SEED_PASSWORD')

  const wedding = await prisma.wedding.create({
    data: { slug: 'default', partner1Name: 'Novio', partner2Name: 'Novia' },
  })

  const hash = await bcrypt.hash(password, 12)
  await prisma.weddingAdmin.create({
    data: { weddingId: wedding.id, email, passwordHash: hash, role: 'ADMIN', name },
  })

  console.log(`✓ Admin created: ${email}`)
  console.log(`✓ Empty wedding placeholder created — update from admin panel`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
