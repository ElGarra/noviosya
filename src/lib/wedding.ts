import { prisma } from './prisma'
import type { Wedding } from '@prisma/client'

export async function getWedding(): Promise<Wedding> {
  const slug = process.env.WEDDING_SLUG
  if (!slug) throw new Error('WEDDING_SLUG env var not set')

  const wedding = await prisma.wedding.findUnique({ where: { slug } })
  if (!wedding) throw new Error(`No wedding found for slug: ${slug}`)
  return wedding
}

export async function getWeddingBySlug(slug: string): Promise<Wedding | null> {
  return prisma.wedding.findUnique({ where: { slug } })
}

export async function getWeddingByDomain(domain: string): Promise<Wedding | null> {
  return prisma.wedding.findUnique({ where: { domain } })
}
