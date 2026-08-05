import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { exchangeJobberCode } from '@/lib/jobber/auth'
import { executeJobberQuery } from '@/lib/jobber/client'
import { ensureJobberTables, saveJobberAccountInfo } from '@/lib/jobber/db'

export const runtime = 'nodejs'

const STATE_COOKIE = 'jobber_oauth_state'
const SETTINGS_PATH = '/christmas/invoices/settings'

const ACCOUNT_QUERY = `query { account { id name } }`

export async function GET(request) {
  const session = await safeAuth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const expectedState = request.cookies.get(STATE_COOKIE)?.value

  const redirectWith = (params) => {
    const target = new URL(SETTINGS_PATH, url.origin)
    for (const [key, value] of Object.entries(params)) {
      target.searchParams.set(key, value)
    }
    const response = NextResponse.redirect(target)
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWith({ jobber_error: 'Invalid or expired Jobber connection attempt. Try again.' })
  }

  try {
    await ensureJobberTables()
    const redirectUri = `${url.origin}/api/jobber/oauth/callback`
    await exchangeJobberCode({ code, redirectUri })

    const data = await executeJobberQuery(ACCOUNT_QUERY)
    await saveJobberAccountInfo({ jobberAccountId: data?.account?.id, accountName: data?.account?.name })

    return redirectWith({ jobber_connected: '1' })
  } catch (error) {
    console.error('[jobber/oauth/callback] connect failed', error)
    return redirectWith({ jobber_error: error.message || 'Unable to connect Jobber.' })
  }
}
