import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { createAnalyticsGoal, listAnalyticsGoals } from '@/lib/platform/store'

export const runtime = 'nodejs'

export const GET = async () => {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  return NextResponse.json({ goals: listAnalyticsGoals() })
}

export const POST = async (request) => {
  const unauthorized = await requireAdminRequest()
  if (unauthorized) {
    return unauthorized
  }

  const body = await request.json()
  const goal = createAnalyticsGoal(body)

  return NextResponse.json({ goal }, { status: 201 })
}
