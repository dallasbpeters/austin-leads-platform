/** Metadata shared by both root layouts: the public site and the operator app. */
const ICON_VERSION = '2'

export const rootMetadata = {
  description: 'Multi-tenant Next.js platform for Austin and Texas local service domains.',
  /*
   * ICON_VERSION busts browser favicon caches. Bump it when the icon files in public/ change.
   */
  icons: {
    apple: [{ sizes: '180x180', type: 'image/png', url: `/apple-touch-icon.png?v=${ICON_VERSION}` }],
    icon: [
      { sizes: 'any', url: `/favicon.ico?v=${ICON_VERSION}` },
      { type: 'image/svg+xml', url: `/favicon.svg?v=${ICON_VERSION}` },
      { sizes: '32x32', type: 'image/png', url: `/favicon-32x32.png?v=${ICON_VERSION}` },
      { sizes: '16x16', type: 'image/png', url: `/favicon-16x16.png?v=${ICON_VERSION}` },
    ],
    shortcut: [`/favicon.ico?v=${ICON_VERSION}`],
  },
  title: 'Texas Solar & Roofing Pros.',
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      'facebook-domain-verification':
        process.env.FACEBOOK_SITE_VERIFICATION || process.env.FACEBOOK_DOMAIN_VERIFICATION,
    },
  },
}
