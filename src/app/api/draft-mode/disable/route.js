import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const redirectTo = new URL(request.url).searchParams.get('redirect') || '/'
  const draft = await draftMode()

  draft.disable()

  return NextResponse.redirect(new URL(redirectTo, request.url))
}
