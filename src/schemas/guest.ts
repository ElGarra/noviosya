import { z } from 'zod'

export const GuestCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  maxCompanions: z.coerce.number().min(0).max(10).default(0),
  group: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  sendInviteNow: z.boolean().default(false),
})

export const GuestImportRowSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  maxCompanions: z.coerce.number().min(0).max(10).default(0),
  group: z.string().optional(),
})

export type GuestCreate = z.infer<typeof GuestCreateSchema>
export type GuestImportRow = z.infer<typeof GuestImportRowSchema>
