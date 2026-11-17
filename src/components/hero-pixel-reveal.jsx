'use client'

import dynamic from 'next/dynamic'

/*
 * The `shaders` library (WebGPU) is megabytes of JS. Imported statically from
 * the hero, it ran at startup on every page with a hero, even where no shader
 * renders: about 2 s of main-thread work on a throttled phone, so taps during
 * load waited (INP). Behind this client boundary it is a separate chunk that
 * only loads on a page whose hero is in Shader mode. Server rendering stays the
 * same, so the hero does not flash. (A `dynamic()` call in the Server Component
 * hero does not split it: Next still runs every client module at startup.)
 */
const HeroPixelReveal = dynamic(() => import('./shaders/PixelReveal1'))

export default HeroPixelReveal
