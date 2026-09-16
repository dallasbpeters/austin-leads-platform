import { NextResponse } from 'next/server'

import { ensureSocialTables } from '@/lib/social/accounts-db'
import { requireSocialAdmin, resolveProvider } from '@/lib/social/request'
import { freshAccount } from '@/lib/social/tokens'

export const runtime = 'nodejs'

/** POST — prove the connection still works: refresh if needed, then read the profile. */
export async function POST(_request, { params }) {
  const auth = await requireSocialAdmin()
  if (auth.error) {
    return auth.error
  }
  const { provider, error } = await resolveProvider(params)
  if (error) {
    return error
  }
  try {
    await ensureSocialTables()
    const account = await freshAccount(provider.id)
    if (!account) {
      return NextResponse.json({ error: `${provider.label} is not connected.` }, { status: 404 })
    }
    const profile = await provider.profile(account.accessToken)
    return NextResponse.json({ ok: true, username: profile.username })
  } catch (testError) {
    return NextResponse.json({ error: testError.message }, { status: 502 })
  }
}
