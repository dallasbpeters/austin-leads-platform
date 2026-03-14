import { NextResponse } from 'next/server'

import { requireAdminRequest } from '@/lib/auth/guards'
import { sanityWriteClient } from '@/sanity/client'

const allowedStatuses = new Set(['todo', 'in_progress', 'blocked', 'done'])

export async function PATCH(request) {
  const authResponse = await requireAdminRequest()

  if (authResponse) {
    return authResponse
  }

  if (!sanityWriteClient) {
    return NextResponse.json({ error: 'Sanity write is not configured' }, { status: 500 })
  }

  const { checklistId, sectionKey, taskKey, status } = await request.json()

  if (!checklistId || !sectionKey || !taskKey || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'Invalid task status payload' }, { status: 400 })
  }

  await sanityWriteClient
    .patch(checklistId)
    .set({
      [`sections[_key=="${sectionKey}"].tasks[_key=="${taskKey}"].status`]: status,
    })
    .commit()

  return NextResponse.json({
    checklistId,
    sectionKey,
    taskKey,
    status,
  })
}
