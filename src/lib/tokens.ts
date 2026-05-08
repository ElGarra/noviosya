import { customAlphabet } from 'nanoid'

// URL-safe alphabet, 21 chars → ~10^37 combinations
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21)

export function generateToken(): string {
  return nanoid()
}
