import AxeBuilder from '@axe-core/playwright'
import { expect, test } from 'vitest'

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
        .analyze()

      expect(results.violations).toEqual([])
    })
  }
})
