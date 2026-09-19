/** Metadata shared by both root layouts: the public site and the operator app. */
export const rootMetadata = {
  apple: [
    {
      sizes: '180x180',
      type: 'image/png',
      url: '/apple-touch-icon.png',
    },
  ],
  description: 'Multi-tenant Next.js platform for Austin and Texas local service domains.',
  icons: {
    icon: [
      { sizes: 'any', url: '/favicon.ico' },
      { type: 'image/svg+xml', url: '/favicon.svg' },
      { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
      { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' },
    ],
    shortcut: ['/favicon.ico'],
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
