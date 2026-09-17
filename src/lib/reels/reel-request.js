import { NextResponse } from 'next/server'

import { safeAuth } from '@/lib/auth/session'
import { themeHasScene, themeId } from '@/lib/reels/themes'

/* A reel is a handful of scenes; anything past this is a mistake or abuse. */
const MAX_SCENES = 20
const MAX_TITLE = 120

export const jsonError = (error, status) => NextResponse.json({ error }, { status })

/** The signed-in staff member, or null. */
export async function reelUser() {
  const session = await safeAuth()
  return session?.user || null
}

/** Validates a save body. Returns `{ error }` or `{ title, scenes, theme }`. */
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
  /* An unknown theme normalises to the default rather than failing: a reel is
   * the operator's work, and a bad theme id is our bug, not something to lose
   * their scenes over. A scene the theme cannot draw IS worth refusing, because
   * the composition would silently skip it and the render would come back short. */
  const theme = themeId(body?.theme)
  const stray = scenes.find((scene) => scene?.type && !themeHasScene(theme, scene.type))
  if (stray) {
    return { error: `The ${theme} theme has no "${stray.type}" scene.` }
  }
  const title = String(body?.title || '')
    .trim()
    .slice(0, MAX_TITLE)
  return { title, scenes, theme }
}
