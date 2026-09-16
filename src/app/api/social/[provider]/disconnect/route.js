import { NextResponse } from 'next/server'

import { deleteSocialAccount, ensureSocialTables } from '@/lib/social/accounts-db'
import { requireSocialAdmin, resolveProvider } from '@/lib/social/request'

export const runtime = 'nodejs'

/** POST — forget the stored tokens. Revoke access in the platform's own settings too. */
export async function POST(_request, { params }) {
  const auth = await requireSocialAdmin()
  if (auth.error) {
    return auth.error
  }
  const { provider, error } = await resolveProvider(params)
  if (error) {
    return error
  }
  await ensureSocialTables()
  await deleteSocialAccount(provider.id)
  return NextResponse.json({ ok: true })
}
