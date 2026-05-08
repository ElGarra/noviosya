import { z } from 'zod'

export const CompanionSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dietaryRestrictions: z.string().max(500).optional(),
})

export const RSVPSubmitSchema = z.object({
  status: z.enum(['CONFIRMED', 'DECLINED']),
  companions: z.array(CompanionSchema).max(10).default([]),
  dietaryRestrictions: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
})

export type RSVPSubmit = z.infer<typeof RSVPSubmitSchema>
export type Companion = z.infer<typeof CompanionSchema>
