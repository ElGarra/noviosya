import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Use onboarding@resend.dev until a domain is verified in Resend dashboard
export const FROM = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
