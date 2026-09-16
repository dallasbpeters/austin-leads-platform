import { redirect } from 'next/navigation'

import ReelStudio from '@/components/reels/reel-studio'
import { safeAuth } from '@/lib/auth/session'
import { listReelPhotos } from '@/lib/reels/photo-library'

export const dynamic = 'force-dynamic'

/*
 * Posts go out under the company's name, so the studio is staff-only — the
 * same bar as the invoice builder.
 */
export default async function ReelsPage() {
  const session = await safeAuth()
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=%2Freels')
  }

  const photos = await listReelPhotos().catch((error) => {
    console.error('[reels] photo library unavailable', error)
    return []
  })

  return <ReelStudio photos={photos} />
}
