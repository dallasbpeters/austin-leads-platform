import { Gloock, JetBrains_Mono } from 'next/font/google'
import localFont from 'next/font/local'

/*
 * Fonts shared by every root layout. Defined once, so Next loads each font file
 * once no matter which layout renders.
 */

export const fontSerif = Gloock({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: '400',
})

/*
 * Aspekta (OFL 1.1, Ivo Dolenc), the sans serif. Self-hosted from src/fonts, so
 * Next serves it from our domain with a size-matched fallback. Only the weights
 * the site uses are listed: Next preloads every file here.
 */
export const fontSans = localFont({
  src: [
    { path: '../fonts/aspekta/Aspekta-300.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/aspekta/Aspekta-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/aspekta/Aspekta-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/aspekta/Aspekta-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/aspekta/Aspekta-700.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/aspekta/Aspekta-800.woff2', weight: '800', style: 'normal' },
    { path: '../fonts/aspekta/Aspekta-900.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-aspekta',
  display: 'swap',
})

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

/** Classes every root layout puts on <body>: the font variables plus the base colors. */
export const bodyClassName = `${fontSerif.variable} ${fontMono.variable} text-foreground bg-background has-[admin-theme]:overflow-hidden`
