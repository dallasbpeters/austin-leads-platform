import { getSocialAccountWithTokens, recordSocialError, updateSocialTokens } from './accounts-db.js'
import { getProvider } from './providers.js'

/* Refresh a little before expiry, so a post never starts with a dying token. */
const REFRESH_MARGIN_MS = 10 * 60 * 1000
/* Instagram only refreshes tokens that are at least a day old and still valid. */
const INSTAGRAM_REFRESH_BEFORE_MS = 7 * 24 * 60 * 60 * 1000

const needsRefresh = (provider, account) => {
  if (!account.expiresAt) {
    return false
  }
  const left = new Date(account.expiresAt).getTime() - Date.now()
  return provider === 'instagram' ? left < INSTAGRAM_REFRESH_BEFORE_MS : left < REFRESH_MARGIN_MS
}

/**
 * The connected account with a usable access token, refreshing it first when
 * it is close to expiring. Returns null when the platform is not connected.
 *
 * @param {'tiktok' | 'instagram'} providerId - Platform.
 * @returns {Promise<object | null>} The account, tokens included (server only).
 */
export async function freshAccount(providerId) {
  const provider = getProvider(providerId)
  const account = await getSocialAccountWithTokens(providerId)
  if (!provider || !account?.accessToken) {
    return null
  }
  if (!needsRefresh(providerId, account)) {
    return account
  }
  try {
    const tokens = await provider.refresh(account)
    await updateSocialTokens(providerId, tokens)
    return { ...account, ...tokens }
  } catch (error) {
    await recordSocialError(providerId, error.message)
    throw error
  }
}
