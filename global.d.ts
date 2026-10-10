import type { DefaultSession, DefaultUser } from 'next-auth'

declare module '*.css'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      id?: string
      role?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User extends DefaultUser {
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    name?: string | null
    email?: string | null
  }
}
