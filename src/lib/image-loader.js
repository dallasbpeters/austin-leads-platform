/*
 * next/image loader for Sanity images: Sanity's own image CDN does the
 * resizing instead of Next's optimizer. Uploads can be huge (a 6600px, 20 MB
 * cutout PNG timed the optimizer out, so it never showed); Sanity handles any
 * size quickly. `auto=format` serves WebP or AVIF, which keep transparency.
 * Params already on the URL (crop, fm, rect…) are kept.
 *
 * Use it through sanityLoaderFor(src): Sanity URLs get this loader, anything
 * else gets undefined, so next/image keeps its default optimizer for it.
 */
const SANITY_IMAGES = 'https://cdn.sanity.io/images/'

export function sanityImageLoader({ src, width, quality }) {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality || 75))
  url.searchParams.set('fit', 'max')
  if (!url.searchParams.has('fm')) {
    url.searchParams.set('auto', 'format')
  }
  return url.toString()
}

export const sanityLoaderFor = (src) =>
  typeof src === 'string' && src.startsWith(SANITY_IMAGES) ? sanityImageLoader : undefined
