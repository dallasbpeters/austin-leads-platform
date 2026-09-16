import { redirect } from 'next/navigation'

import ReelStudio from '@/components/reels/reel-studio'
import { safeAuth } from '@/lib/auth/session'
import { listReelPhotos } from '@/lib/reels/photo-library'
import { ensureReelTables, getReel } from '@/lib/reels/reel-db'

export const dynamic = 'force-dynamic'

/*
 * Posts go out under the company's name, so the studio is staff-only — the
 * same bar as the invoice builder.
 */
export default async function ReelsPage({ searchParams }) {
  const session = await safeAuth()
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=%2Freels')
  }

  const params = await searchParams
  const reelId = typeof params?.id === 'string' ? params.id : null

  const [photos, initialReel] = await Promise.all([
    listReelPhotos().catch((error) => {
      console.error('[reels] photo library unavailable', error)
      return []
    }),
    reelId ? loadReel(reelId) : null,
  ])

  /* A fresh studio per reel, so switching reels never mixes their scenes. */
  return <ReelStudio initialReel={initialReel} key={initialReel?.id || 'new'} photos={photos} />
}

async function loadReel(id) {
  try {
    await ensureReelTables()
    return await getReel(id)
  } catch (error) {
    console.error('[reels] could not load reel', id, error)
    return null
  }
}
