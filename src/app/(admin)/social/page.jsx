import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import SocialAccountsClient from '@/components/admin/social-accounts-client'
import { isFullAdminRole } from '@/lib/auth/roles'
import { safeAuth } from '@/lib/auth/session'
import { ensureSocialTables, hasTokenKey, listSocialAccounts } from '@/lib/social/accounts-db'
import { callbackPath, SOCIAL_PROVIDERS } from '@/lib/social/providers'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Social accounts | Austin Leads Admin' }

/** The address the platforms will send people back to — shown so it can be pasted into each app. */
async function redirectBase() {
  const pinned = (process.env.SOCIAL_REDIRECT_BASE || '').trim().replace(/\/$/, '')
  if (pinned) {
    return pinned
  }
  const list = await headers()
  const host = list.get('x-forwarded-host') || list.get('host')
  const proto = list.get('x-forwarded-proto') || (host?.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export default async function SocialAccountsPage({ searchParams }) {
  const session = await safeAuth()
  if (!session?.user) {
    redirect('/sign-in')
  }
  if (!isFullAdminRole(session.user.role)) {
    redirect('/reels')
  }

  const params = await searchParams
  const base = await redirectBase()

  let accounts = []
  let dbError = null
  try {
    await ensureSocialTables()
    accounts = await listSocialAccounts()
  } catch (error) {
    dbError = error.message
  }

  const platforms = Object.values(SOCIAL_PROVIDERS).map((provider) => {
    const redirectUri = `${base}${callbackPath(provider.id)}`
    return {
      id: provider.id,
      label: provider.label,
      configured: provider.configured(),
      envVars: provider.envVars,
      scopes: provider.scopes,
      redirectUri,
      setup: provider.setup.map((step) => step.replace('{redirectUri}', redirectUri)),
      account: accounts.find((account) => account.provider === provider.id) || null,
    }
  })

  return (
    <SocialAccountsClient
      connected={typeof params?.connected === 'string' ? params.connected : null}
      dbError={dbError}
      error={typeof params?.error === 'string' ? params.error : null}
      platforms={platforms}
      tokenKeySet={hasTokenKey()}
    />
  )
}
