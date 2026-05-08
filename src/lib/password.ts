import { z } from 'zod'

export const PasswordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .max(100)
  .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un número')

export const BCRYPT_ROUNDS = 12
