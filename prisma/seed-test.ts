import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { customAlphabet } from 'nanoid'

const prisma = new PrismaClient()
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function main() {
  console.log('\n🌱 Seeding test data...\n')

  // ── Wedding ────────────────────────────────────────────────────────────────
  const wedding = await prisma.wedding.upsert({
    where: { slug: 'florencia-matias' },
    update: {
      venueName:    'Casona San Ignacio',
      venueAddress: 'Caupolicán 8611, Quilicura, Chile',
      venueMapsUrl: 'https://google.com/maps/place/Casona+San+Ignacio/@-33.3413588,-70.6944469,17z',
      weddingDate:  new Date('2027-03-27T15:00:00-03:00'),
      dressCode:    'Formal',
      rsvpEnabled:  true,
    },
    create: {
      slug:         'florencia-matias',
      partner1Name: 'Florencia',
      partner2Name: 'Matias',
      weddingDate:  new Date('2027-03-27T15:00:00-03:00'),
      timezone:     'America/Santiago',
      locale:       'es',
      rsvpEnabled:  true,
      venueName:    'Casona San Ignacio',
      venueAddress: 'Caupolicán 8611, Quilicura, Chile',
      venueMapsUrl: 'https://google.com/maps/place/Casona+San+Ignacio/@-33.3413588,-70.6944469,17z',
      dressCode:    'Formal',
    },
  })

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash  = await bcrypt.hash('Admin123!', 12)
  const coupleHash = await bcrypt.hash('Novios123!', 12)

  const users = [
    { email: 'joaquin.castanos@gmail.com', name: 'Joaquin',  role: 'ADMIN'  as const, hash: adminHash },
    { email: 'florencia@test.com',         name: 'Florencia', role: 'COUPLE' as const, hash: coupleHash },
    { email: 'matias@test.com',            name: 'Matias',    role: 'COUPLE' as const, hash: coupleHash },
  ]

  for (const u of users) {
    await prisma.weddingAdmin.upsert({
      where: { weddingId_email: { weddingId: wedding.id, email: u.email } },
      update: { passwordHash: u.hash, role: u.role, name: u.name },
      create: { weddingId: wedding.id, email: u.email, passwordHash: u.hash, role: u.role, name: u.name },
    })
  }

  // ── Guests ─────────────────────────────────────────────────────────────────
  const guestData = [
    { firstName: 'Valentina', lastName: 'Morales',    email: 'val@test.com',     maxCompanions: 1, group: 'familia' },
    { firstName: 'Sebastián', lastName: 'Fernández',  email: 'seba@test.com',    maxCompanions: 1, group: 'familia' },
    { firstName: 'Camila',    lastName: 'Torres',     email: 'cami@test.com',    maxCompanions: 0, group: 'amigos' },
    { firstName: 'Diego',     lastName: 'Ramírez',    email: 'diego@test.com',   maxCompanions: 2, group: 'amigos' },
    { firstName: 'Isadora',   lastName: 'Vega',       email: 'isa@test.com',     maxCompanions: 1, group: 'amigos' },
    { firstName: 'Tomás',     lastName: 'Herrera',    email: 'tomas@test.com',   maxCompanions: 0, group: 'trabajo' },
    { firstName: 'Antonia',   lastName: 'Castillo',   email: 'anto@test.com',    maxCompanions: 1, group: 'familia' },
    { firstName: 'Nicolás',   lastName: 'Pérez',      email: 'nico@test.com',    maxCompanions: 0, group: 'trabajo' },
    { firstName: 'Javiera',   lastName: 'Soto',       email: null,               maxCompanions: 1, group: 'amigos' },
    { firstName: 'Ignacio',   lastName: 'Muñoz',      email: null,               maxCompanions: 0, group: 'familia' },
  ]

  const guests = []
  for (const g of guestData) {
    const token = nanoid()
    const guest = await prisma.guest.upsert({
      where: { token },
      update: {},
      create: {
        weddingId:     wedding.id,
        token,
        firstName:     g.firstName,
        lastName:      g.lastName,
        email:         g.email,
        maxCompanions: g.maxCompanions,
        group:         g.group,
      },
    })
    guests.push({ ...g, token, id: guest.id })
  }

  // ── Gift items ─────────────────────────────────────────────────────────────
  const giftData = [
    { title: 'KitchenAid Artisan',        price: 450000, description: 'Batidora de pie color crema' },
    { title: 'Noche en hotel',            price: 180000, description: 'Una noche en hotel boutique' },
    { title: 'Set de sábanas de hilo',    price: 120000, description: '300 hilos, blanco' },
    { title: 'Contribución luna de miel', price:  50000, description: 'Cualquier aporte suma ✈️' },
    { title: 'Juego de copas Riedel',     price:  85000, description: '6 copas de vino tinto' },
  ]

  await prisma.giftItem.deleteMany({ where: { weddingId: wedding.id } })
  for (let i = 0; i < giftData.length; i++) {
    await prisma.giftItem.create({
      data: { weddingId: wedding.id, sortOrder: i, currency: 'CLP', ...giftData[i] },
    })
  }

  // ── Print access info ──────────────────────────────────────────────────────
  console.log('━'.repeat(60))
  console.log('👤 ADMIN')
  console.log(`   URL:      ${APP_URL}/admin/login`)
  console.log(`   Email:    joaquin.castanos@gmail.com`)
  console.log(`   Password: Admin123!`)

  console.log('\n💍 NOVIOS')
  console.log(`   URL:      ${APP_URL}/couple/login`)
  console.log(`   Florencia — florencia@test.com  /  Novios123!`)
  console.log(`   Matias    — matias@test.com      /  Novios123!`)

  console.log('\n🎟️  INVITADOS (links personales)')
  for (const g of guests) {
    const tag = g.email ? '' : ' (sin email)'
    console.log(`   ${g.firstName.padEnd(10)} ${g.lastName.padEnd(12)} — ${APP_URL}/i/${g.token}${tag}`)
  }

  console.log('\n' + '━'.repeat(60))
  console.log('✅ Done!\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
