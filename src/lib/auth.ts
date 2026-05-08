import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { getWedding } from './wedding'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const wedding = await getWedding()
        const admin = await prisma.weddingAdmin.findUnique({
          where: { weddingId_email: { weddingId: wedding.id, email: credentials.email } },
        })
        if (!admin) return null

        const valid = await bcrypt.compare(credentials.password, admin.passwordHash)
        if (!valid) return null

        return { id: admin.id, email: admin.email, weddingId: wedding.id }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.weddingId = (user as { weddingId: string }).weddingId
      return token
    },
    session({ session, token }) {
      session.user.weddingId = token.weddingId as string
      return session
    },
  },
}
