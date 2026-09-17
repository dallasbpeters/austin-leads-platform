import { redirect } from 'next/navigation'

import ReelStudio from '@/components/reels/reel-studio'
import { safeAuth } from '@/lib/auth/session'
import { listReelPhotos } from '@/lib/reels/photo-library'
import { ensureReelTables, getReel } from '@/lib/reels/reel-db'
import { themeId } from '@/lib/reels/themes'

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

  /*
   * The photo order depends on the theme, so the reel is loaded first. A saved
   * reel brings its own theme; a new one takes it from `?theme=`, which is how
   * the studio's picker asks for a different starting look.
   */
  const initialReel = reelId ? await loadReel(reelId) : null
  const theme = themeId(initialReel?.theme || params?.theme)

  const photos = await listReelPhotos({ theme }).catch((error) => {
    console.error('[reels] photo library unavailable', error)
    return []
  })

  /* A fresh studio per reel and per theme, so switching never mixes their scenes. */
  return (
    <ReelStudio
      initialReel={initialReel}
      initialTheme={theme}
      key={initialReel?.id || `new-${theme}`}
      photos={photos}
    />
  )
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
