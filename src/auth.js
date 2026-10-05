import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import Zoho from 'next-auth/providers/zoho'

import { getActivePlatformUserForGoogle, normalizeEmail, verifyCredentials } from '@/lib/auth/users'
import {
  buildZohoAuthorizationUrl,
  refreshZohoUserAccessToken,
  zohoScopeAllowsContactSearch,
} from '@/lib/zoho/user-auth'

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET

// Zoho login. Prefer dedicated AUTH_ZOHO_* vars; fall back to the API
// client credentials if the same Zoho client is used for both (it must be a
// "Server-based Applications" client with the /api/auth/callback/zoho
// redirect URI registered — self clients cannot do browser logins).
const zohoClientId = process.env.AUTH_ZOHO_ID || process.env.ZOHO_CLIENT_ID
const zohoClientSecret = process.env.AUTH_ZOHO_SECRET || process.env.ZOHO_CLIENT_SECRET
const zohoAccountsUrl = (process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com').replace(/\/$/, '')

// OAuth providers whose sign-ins are gated by the platform_users table.
const GATED_OAUTH_PROVIDERS = new Set(['google', 'zoho'])

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

if (zohoClientId && zohoClientSecret) {
  providers.push(
    Zoho({
      clientId: zohoClientId,
      clientSecret: zohoClientSecret,
      // Put scopes in the authorize URL string so Auth.js cannot drop them
      // when merging with the provider default (profile-only scope).
      authorization: buildZohoAuthorizationUrl(),
      token: `${zohoAccountsUrl}/oauth/v2/token`,
      userinfo: `${zohoAccountsUrl}/oauth/user/info`,
      // Zoho server apps are happier with state than PKCE.
      checks: ['state'],
    }),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/sign-in',
    // Send OAuth failures (e.g. AccessDenied) back to our sign-in page with
    // a friendly message instead of NextAuth's bare error page.
    error: '/sign-in',
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
  /*
   * The Sanity-hosted Studio runs on another origin (austin-leads-platform
   * .sanity.studio), and its Content agent tool posts to /api/chat with
   * credentials. A SameSite=Lax cookie is not sent on that cross-site request,
   * so the session has to be SameSite=None -- which browsers only accept
   * alongside Secure.
   *
   * Secure cookies still work on http://localhost, so dev is unaffected.
   */
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (!GATED_OAUTH_PROVIDERS.has(account?.provider)) {
        return true
      }
      const email = normalizeEmail(user?.email)
      if (!email) {
        console.warn(`[auth] ${account.provider} sign-in denied: provider returned no email`)
        return false
      }
      const dbUser = await getActivePlatformUserForGoogle(email)
      if (dbUser) {
        return true
      }
      const adminEmail = normalizeEmail(process.env.AUTH_ADMIN_EMAIL)
      if (adminEmail && email === adminEmail) {
        return true
      }
      console.warn(`[auth] ${account.provider} sign-in denied for ${email}: no active platform_users row`)
      return false
    },
    async jwt({ token, user, account }) {
      // Capture per-user Zoho tokens for CRM contact typeahead (not Sheet/WorkDrive).
      if (account?.provider === 'zoho') {
        token.zohoAccessToken = account.access_token
        if (account.refresh_token) {
          token.zohoRefreshToken = account.refresh_token
        }
        token.zohoExpiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 55 * 60 * 1000
        // Zoho returns granted scopes on the token response (also via account.scope).
        token.zohoScope = account.scope || token.zohoScope || null
        if (account.api_domain) {
          token.zohoApiDomain = String(account.api_domain).replace(/\/$/, '')
        }
      }

      // Refresh user Zoho access token when stale.
      if (token.zohoRefreshToken) {
        const expiresAt = Number(token.zohoExpiresAt || 0)
        const stale = !token.zohoAccessToken || expiresAt < Date.now() + 60_000
        if (stale) {
          try {
            const refreshed = await refreshZohoUserAccessToken(token.zohoRefreshToken)
            token.zohoAccessToken = refreshed.accessToken
            token.zohoRefreshToken = refreshed.refreshToken
            token.zohoExpiresAt = refreshed.expiresAt
            token.zohoApiDomain = refreshed.apiDomain
            if (refreshed.scope) {
              token.zohoScope = refreshed.scope
            }
          } catch (error) {
            console.error('[auth] Zoho user token refresh failed', error)
            token.zohoAccessToken = undefined
            token.zohoExpiresAt = 0
          }
        }
      }

      // Known profile-only consent cannot call Contacts/search — drop tokens so UI
      // shows Connect Zoho. (OAuth refresh never expands scopes.)
      if (
        token.zohoScope !== null &&
        token.zohoScope !== undefined &&
        !zohoScopeAllowsContactSearch(token.zohoScope)
      ) {
        token.zohoAccessToken = undefined
        token.zohoRefreshToken = undefined
        token.zohoExpiresAt = 0
        token.zohoScope = null
        token.zohoNeedsReauth = true
      } else {
        token.zohoNeedsReauth = false
      }

      if (!user) {
        return token
      }

      if (GATED_OAUTH_PROVIDERS.has(account?.provider)) {
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
        // Flag only — never expose Zoho tokens to the browser.
        session.user.zohoConnected =
          Boolean(token.zohoRefreshToken || token.zohoAccessToken) &&
          !token.zohoNeedsReauth &&
          (token.zohoScope === null ||
            token.zohoScope === undefined ||
            zohoScopeAllowsContactSearch(token.zohoScope))
        session.user.zohoNeedsReauth = Boolean(token.zohoNeedsReauth)
      }

      return session
    },
  },
})
