/*
 * Playwright, not Vitest. `vitest.config.ts` excludes `**\/e2e/**`, so this file
 * is only ever run by `pnpm test:playwright`. Importing `test` from vitest here
 * meant Playwright collected zero tests and failed on the first `describe`.
 */
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PUBLIC_ROUTES: { path: string; label: string }[] = [
  { path: '/', label: 'homepage' },
  { path: '/about', label: 'about' },
  { path: '/book', label: 'book' },
  { path: '/guides', label: 'guides-index' },
  { path: '/hail-damage', label: 'hail-damage' },
  { path: '/hail-map', label: 'hail-map' },
  { path: '/roofing', label: 'roofing' },
  { path: '/service-request', label: 'service-request' },
  { path: '/services', label: 'services-index' },
  { path: '/solar', label: 'solar' },
  { path: '/style-guide', label: 'style-guide' },
  { path: '/sign-in', label: 'sign-in' },
]

test.describe('a11y — public routes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.label} (${route.path})`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'load' })
      await page.waitForTimeout(3000)

      const results = await new AxeBuilder({ page })
        .exclude('[data-feedback-toolbar="true"]')
        .exclude('[title="Start feedback mode"]')
        /*
         * Third-party embeds render markup we cannot change, and their loading
         * skeletons fail contrast while they swap in. Scanning them made this
         * suite fail at random depending on how far the widget had loaded.
         */
        .exclude('[data-third-party-embed]')
        /* Token specimens on the style guide are shown outside their own theme
         * on purpose, so their contrast is not a real-world failure. */
        .exclude('[data-token-preview]')
        .analyze()

      expect(results.violations).toEqual([])
    })
  }
})
