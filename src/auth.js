import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

import { getActivePlatformUserForGoogle, normalizeEmail, verifyCredentials } from '@/lib/auth/users'

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET

const providers = [
  Credentials({
    name: 'Admin Login',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const email = normalizeEmail(credentials?.email)
      const password = credentials?.password?.toString() ?? ''

      if (!email || !password) {
        return null
      }

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
]

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  )
}

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
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') {
        return true
      }
      const email = normalizeEmail(user?.email)
      if (!email) {
        return false
      }
      const dbUser = await getActivePlatformUserForGoogle(email)
      if (dbUser) {
        return true
      }
      const adminEmail = normalizeEmail(process.env.AUTH_ADMIN_EMAIL)
      return Boolean(adminEmail && email === adminEmail)
    },
    async jwt({ token, user, account }) {
      if (!user) {
        return token
      }

      if (account?.provider === 'google') {
        const email = normalizeEmail(user.email)
        const dbUser = await getActivePlatformUserForGoogle(email)
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.name = dbUser.name ?? user.name ?? user.email
          token.email = dbUser.email
          return token
        }
        const adminEmail = normalizeEmail(process.env.AUTH_ADMIN_EMAIL)
        if (adminEmail && email === adminEmail) {
          token.id = 'platform-admin'
          token.role = 'admin'
          token.name = process.env.AUTH_ADMIN_NAME || user.name || 'Platform Admin'
          token.email = adminEmail
        }
        return token
      }

      token.id = user.id
      token.role = user.role
      token.name = user.name
      token.email = user.email
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
