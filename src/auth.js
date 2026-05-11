import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { normalizeEmail, verifyCredentials } from '@/lib/auth/users'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/sign-in',
  },
  logger: {
    error(error) {
      if (error?.type === 'JWTSessionError' || error?.code === 'JWTSessionError') {
        return
      }

      console.error(error)
    },
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email)
        const password = credentials?.password?.toString() ?? ''

        if (!email || !password) return null

        // Prefer the platform_users DB record so admins managed through /users
        // can sign in immediately.
        const dbUser = await verifyCredentials(email, password)
        if (dbUser) {
          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || 'Platform Admin',
            role: dbUser.role,
          }
        }

        // Break-glass fallback so the operator can always log in (e.g. before
        // the first DB user is seeded, or if the DB is unreachable).
        const adminEmail = normalizeEmail(process.env.AUTH_ADMIN_EMAIL)
        const adminPassword = process.env.AUTH_ADMIN_PASSWORD
        if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
          return {
            id: 'platform-admin',
            email: adminEmail,
            name: process.env.AUTH_ADMIN_NAME || 'Platform Admin',
            role: 'admin',
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role
      }

      return session
    },
  },
})
