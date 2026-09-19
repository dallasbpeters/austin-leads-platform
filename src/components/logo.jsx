import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

/*
 * The drawing lives in `public/logo-mark.svg` (a `<symbol id="logo">`). Inlined, it
 * was 60 KB, sent twice per page (header and footer) and again in the React
 * payload — about half of the home page HTML. Referenced with `<use>`, it
 * downloads once and caches. Theme colors still apply: the symbol's paths use
 * `var(--logo-*)` and `currentColor`, which inherit through `<use>`.
 *
 * Keep the paths in sync with `logo-inline.jsx`.
 */
const LOGO_SPRITE_HREF = '/logo-mark.svg#logo'

export default function Logo({ className, height = '100%', width = '100%', fill = 'none' }) {
  return (
    <motion.svg
      whileHover={{ scale: 1.1 }}
      className={cn('logo text-primary fill-current', className)}
      viewBox="0 0 256 180"
      height={height}
      width={width}
      aria-hidden="true"
      fill={fill}
    >
      <use href={LOGO_SPRITE_HREF} />
    </motion.svg>
  )
}
