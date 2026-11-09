'use client'

import Image from 'next/image'

import { sanityLoaderFor } from '@/lib/image-loader'

/**
 * next/image, with Sanity images resized by Sanity's CDN (src/lib/image-loader.js)
 * and everything else by Next's optimizer. A client component, because a loader
 * is a function and server components cannot pass functions to next/image.
 */
const SiteImage = (props) => <Image loader={sanityLoaderFor(props.src)} {...props} />

export default SiteImage
