import { expect, test } from '@playwright/test'

/*
 * Geometry regression: the public header must never cover the hero's first
 * content. Measures rendered boxes rather than class names or CSS text.
 *
 * - Solar shell: `.site-header` is sticky and takes flow space.
 * - Generic shell (Christmas): `.generic-header` is fixed over the hero media,
 *   so the hero copy has to start below the bar on its own.
 */

const VIEWPORTS = [
  { label: 'mobile', width: 375, height: 667 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1280, height: 800 },
]

const ROUTES = [
  { path: '/', label: 'solar home', site: 'texas-solar-and-roofing-pros' },
  { path: '/?__site=txchristmaslights', label: 'christmas home (query override)', site: 'txchristmaslights' },
  {
    path: '/_site/txchristmaslights',
    label: 'christmas home (Presentation route)',
    site: 'txchristmaslights',
  },
]

/** Smallest gap the first hero line keeps below the header, in CSS px. */
const MIN_GAP = 8

const measure = async (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const box = (el: Element | null) => {
      if (!el) {
        return null
      }
      const rect = el.getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom, height: rect.height }
    }
    // Find the header by how it is positioned, not by class, so the test still
    // measures a build that predates the .generic-header hook.
    const navs = Array.from(document.querySelectorAll('nav'))
    const generic = navs.find((nav) => getComputedStyle(nav).position === 'fixed') ?? null
    const bar = generic ? generic.firstElementChild : document.querySelector('.site-header__bar')
    const firstLine =
      document.querySelector('.solar-hero__eyebrow') ?? document.querySelector('.solar-hero__title')
    return {
      site: document.documentElement.dataset.publicSite ?? null,
      headerKind: generic ? 'fixed' : 'sticky',
      bar: box(bar),
      hero: box(document.querySelector('.solar-hero')),
      firstLine: box(firstLine),
      title: box(document.querySelector('.solar-hero__title')),
    }
  })

test.describe('public header never covers the hero copy', () => {
  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      test(`${route.label} @ ${viewport.label} ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        const response = await page.goto(route.path, { waitUntil: 'networkidle' })
        const status = response?.status() ?? 0

        const probe = await measure(page)
        // The Christmas tenant lives in Sanity only; without read access the route 404s.
        test.skip(
          route.site === 'txchristmaslights' && (status === 404 || probe.site !== route.site),
          `tenant "${route.site}" is not resolvable here (status ${status}, site ${probe.site})`,
        )

        expect(status, 'route should render').toBe(200)
        expect(probe.site).toBe(route.site)
        await page.locator('.solar-hero__eyebrow, .solar-hero__title').first().waitFor()
        // Let the header publish its measured offset and fonts settle.
        await page.waitForTimeout(500)

        const geometry = await measure(page)
        expect(geometry.bar, 'header bar should render').not.toBeNull()
        expect(geometry.hero, 'hero should render').not.toBeNull()
        expect(geometry.firstLine, 'hero eyebrow or title should render').not.toBeNull()

        const bar = geometry.bar as { top: number; bottom: number; height: number }
        const hero = geometry.hero as { top: number; bottom: number; height: number }
        const firstLine = geometry.firstLine as { top: number; bottom: number; height: number }
        const title = geometry.title as { top: number; bottom: number; height: number }

        expect(bar.height).toBeGreaterThan(0)
        // First visible hero line clears the header with breathing room.
        expect(firstLine.top).toBeGreaterThanOrEqual(bar.bottom + MIN_GAP)
        expect(title.top).toBeGreaterThanOrEqual(bar.bottom + MIN_GAP)

        if (geometry.headerKind === 'fixed') {
          // Design intent: the hero media still runs up under the floating bar.
          expect(hero.top).toBeLessThanOrEqual(bar.top)
        } else {
          // Sticky header sits in flow: the hero starts where the header ends.
          expect(hero.top).toBeGreaterThanOrEqual(bar.bottom - 1)
        }
      })
    }
  }
})

/*
 * Hydration regression: the CSS fallback for --site-header-offset must land
 * within 1px of the value generic-header.jsx measures, or the hero copy jumps
 * while JavaScript loads. Compared on both sides of the 48rem breakpoint.
 */
const HYDRATION_VIEWPORTS = [
  { label: 'mobile', width: 375, height: 667 },
  { label: 'tablet', width: 768, height: 1024 },
]

/** Largest shift the first hero line may make between first paint and hydration, in CSS px. */
const MAX_HYDRATION_SHIFT = 1

/** Waits for the hero copy's entrance animation (solar-fade-up) so the read is its resting position. */
const settleHeroCopy = (page: import('@playwright/test').Page) =>
  page.evaluate(() =>
    Promise.all(
      (document.querySelector('.solar-hero__copy')?.getAnimations() ?? []).map((animation) =>
        animation.finished.catch(() => null),
      ),
    ),
  )

test.describe('generic header hydration does not move the hero copy', () => {
  for (const viewport of HYDRATION_VIEWPORTS) {
    test(`christmas home (Presentation route) @ ${viewport.label} ${viewport.width}x${viewport.height}`, async ({
      browser,
      page,
    }) => {
      const path = '/_site/txchristmaslights'

      // First paint: no JavaScript, so only the CSS fallback positions the hero.
      const staticContext = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        javaScriptEnabled: false,
      })
      const staticPage = await staticContext.newPage()
      const staticResponse = await staticPage.goto(path, { waitUntil: 'load' })
      const staticStatus = staticResponse?.status() ?? 0
      if (staticStatus === 200) {
        await settleHeroCopy(staticPage)
      }
      const staticProbe = await measure(staticPage)
      await staticContext.close()

      test.skip(
        staticStatus === 404 || staticProbe.site !== 'txchristmaslights',
        `tenant "txchristmaslights" is not resolvable here (status ${staticStatus}, site ${staticProbe.site})`,
      )
      expect(staticStatus, 'route should render without JavaScript').toBe(200)
      expect(staticProbe.headerKind).toBe('fixed')
      expect(staticProbe.firstLine, 'hero eyebrow or title should render without JavaScript').not.toBeNull()

      // Hydrated: the header has published its measured offset.
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(path, { waitUntil: 'networkidle' })
      await page.locator('.solar-hero__eyebrow, .solar-hero__title').first().waitFor()
      // Let the header publish its measured offset and the hero copy settle.
      await page.waitForTimeout(500)
      await settleHeroCopy(page)
      const hydratedProbe = await measure(page)
      expect(hydratedProbe.headerKind).toBe('fixed')
      expect(hydratedProbe.firstLine, 'hero eyebrow or title should render after hydration').not.toBeNull()

      const staticTop = (staticProbe.firstLine as { top: number }).top
      const hydratedTop = (hydratedProbe.firstLine as { top: number }).top
      expect(
        Math.abs(hydratedTop - staticTop),
        'hero copy should not shift on hydration',
      ).toBeLessThanOrEqual(MAX_HYDRATION_SHIFT)
    })
  }
})
