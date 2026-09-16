import { ensureSocialTables, saveSocialAccount } from '@/lib/social/accounts-db'
import { callbackPath } from '@/lib/social/providers'
import {
  backToSocialPage,
  redirectBase,
  requireSocialAdmin,
  resolveProvider,
  STATE_COOKIE,
} from '@/lib/social/request'

export const runtime = 'nodejs'

/** GET — the platform sends the admin back here with a one-time code. */
export async function GET(request, { params }) {
  const auth = await requireSocialAdmin()
  if (auth.error) {
    return auth.error
  }
  const { provider, error } = await resolveProvider(params)
  if (error) {
    return error
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const expected = request.cookies.get(STATE_COOKIE)?.value
  const denied = url.searchParams.get('error_description') || url.searchParams.get('error')

  if (denied) {
    return backToSocialPage(request, { error: `${provider.label}: ${denied}` })
  }
  if (!code || !state || !expected || state !== expected || !state.startsWith(`${provider.id}.`)) {
    return backToSocialPage(request, { error: 'That connection attempt expired. Try again.' })
  }

  try {
    await ensureSocialTables()
    const redirectUri = `${redirectBase(request)}${callbackPath(provider.id)}`
    // Instagram appends "#_" to the code in some flows.
    const tokens = await provider.exchangeCode({ code: code.replace(/#_$/, ''), redirectUri })
    const profile = await provider.profile(tokens.accessToken)
    await saveSocialAccount(provider.id, {
      ...tokens,
      accountId: tokens.accountId || profile.accountId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      connectedBy: auth.user.email || auth.user.name || null,
    })
    return backToSocialPage(request, { connected: provider.id })
  } catch (connectError) {
    console.error(`[social/${provider.id}] connect failed`, connectError)
    return backToSocialPage(request, { error: connectError.message })
  }
}
