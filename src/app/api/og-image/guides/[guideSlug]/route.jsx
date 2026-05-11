import { GET as guideGuideImage, HEAD as headGuideImage } from '@/app/api/og/guides/[guideSlug]/route'

export const runtime = 'nodejs'

export async function GET(request, context) {
  return guideGuideImage(request, context)
}

export async function HEAD(request, context) {
  return headGuideImage(request, context)
}
