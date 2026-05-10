import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  if (!email) throw new Error('Required: ADMIN_EMAIL')

  const admin = await prisma.weddingAdmin.findFirst({ where: { email, role: 'ADMIN' } })
  if (!admin) throw new Error(`Admin not found: ${email}`)

  // Delete all weddings except the admin's (cascade handles guests, gifts, admins)
  const deleted = await prisma.wedding.deleteMany({
    where: admin.weddingId ? { id: { not: admin.weddingId } } : {},
  })

  // Clean the admin's own wedding: guests and gifts
  if (admin.weddingId) {
    await prisma.guest.deleteMany({ where: { weddingId: admin.weddingId } })
    await prisma.giftItem.deleteMany({ where: { weddingId: admin.weddingId } })
  }

  console.log(`✓ Deleted ${deleted.count} other wedding(s)`)
  console.log(`✓ Cleared guests and gifts from admin wedding`)
  console.log(`✓ Admin account preserved: ${email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
