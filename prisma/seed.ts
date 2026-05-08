import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const wedding = await prisma.wedding.upsert({
    where: { slug: 'florencia-matias' },
    update: {},
    create: {
      slug: 'florencia-matias',
      partner1Name: 'Florencia',
      partner2Name: 'Matias',
      weddingDate: new Date('2027-03-27T18:00:00-03:00'),
      timezone: 'America/Santiago',
      locale: 'es',
      rsvpEnabled: true,
    },
  })

  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_SEED_PASSWORD ?? 'admin123',
    10
  )

  await prisma.weddingAdmin.upsert({
    where: { weddingId_email: { weddingId: wedding.id, email: 'joaquin.castanos@gmail.com' } },
    update: {},
    create: {
      weddingId: wedding.id,
      email: 'joaquin.castanos@gmail.com',
      passwordHash,
    },
  })

  console.log(`✓ Wedding "${wedding.slug}" ready`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
