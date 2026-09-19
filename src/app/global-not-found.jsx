import RootDocument from '@/components/root-document'

import NotFound from './(site)/tenant/[site]/not-found'

/*
 * The app has two root layouts (public tenant pages and the operator app), and
 * the public one sits under the dynamic `[site]` segment. Next then has no single
 * layout to wrap a 404 in, so cached pages that call `notFound()` fall back to
 * this page. It cannot know the tenant, so it renders with the neutral theme.
 */
export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function GlobalNotFound() {
  return (
    <RootDocument>
      <NotFound />
    </RootDocument>
  )
}
