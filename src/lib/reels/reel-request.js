import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'

/* A reel is a handful of scenes; anything past this is a mistake or abuse. */
const MAX_SCENES = 20
const MAX_TITLE = 120

export const jsonError = (error, status) => NextResponse.json({ error }, { status })

/** The signed-in staff member, or null. */
export async function reelUser() {
  const session = await safeAuth()
  return session?.user || null
}

/** Validates a save body. Returns `{ error }` or `{ title, scenes }`. */
export async function readReelBody(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return { error: 'Invalid JSON body' }
  }
  const scenes = Array.isArray(body?.scenes) ? body.scenes : null
  if (!scenes || !scenes.length) {
    return { error: 'A reel needs at least one scene.' }
  }
  if (scenes.length > MAX_SCENES) {
    return { error: `A reel can have up to ${MAX_SCENES} scenes.` }
  }
  const title = String(body?.title || '')
    .trim()
    .slice(0, MAX_TITLE)
  return { title, scenes }
}
