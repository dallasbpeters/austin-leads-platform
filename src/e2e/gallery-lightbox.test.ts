import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * The Texas Christmas Lights homepage carries the only live gallery section, so
 * it is the browser fixture for the project grid + lightbox. Content comes from
 * Sanity, so the checks are shape-based (counts, controls, sizing) rather than
 * tied to specific photos.
 */
const GALLERY_PATH = '/_site/txchristmaslights'

const VIEWPORTS = [
  { label: 'mobile', width: 390, height: 844 },
  { label: 'tablet', width: 820, height: 1180 },
  { label: 'desktop', width: 1440, height: 900 },
] as const

/**
 * Fail loudly on browser-side exceptions. A script that throws during startup
 * (for example a missing NEXT_PUBLIC_* variable in instrumentation-client.ts)
 * aborts React hydration: the page still renders, but no button has a handler,
 * and the only symptom would be a confusing "dialog not visible" timeout.
 */
const collectPageErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

const openFirstProject = async (page: Page, pageErrors: string[]) => {
  const tile = page.locator('.gallery__tile').first()
  await tile.scrollIntoViewIfNeeded()
  const dialog = page.getByRole('dialog')
  // `load` fires before hydration finishes on a cold dev server, and a keypress
  // on a not-yet-hydrated button is dropped. Keep pressing until React answers.
  await expect(async () => {
    // A startup exception means hydration will never finish: surface it instead
    // of a bare "dialog not visible" timeout.
    expect(pageErrors).toStrictEqual([])
    await tile.focus()
    await tile.press('Enter')
    await expect(dialog).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 30_000 })
  return { tile, dialog }
}

const parseCount = async (dialog: ReturnType<Page['getByRole']>) => {
  const text = (await dialog.locator('.gallery-lightbox__count .sr-only').textContent()) ?? ''
  const match = text.match(/Photo (\d+) of (\d+)/)
  expect(match).not.toBeNull()
  return { index: Number(match?.[1]), total: Number(match?.[2]) }
}

test.describe('gallery projects lightbox', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.label}: opens a large uncropped lightbox for one project`, async ({ page }) => {
      const pageErrors = collectPageErrors(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(GALLERY_PATH, { waitUntil: 'load' })

      const tiles = page.locator('.gallery__tile')
      await expect(tiles.first()).toBeVisible()
      const tileCount = await tiles.count()
      expect(tileCount).toBeGreaterThan(0)

      const { tile, dialog } = await openFirstProject(page, pageErrors)
      const count = await parseCount(dialog)
      expect(count.index).toBe(1)
      expect(count.total).toBeGreaterThan(0)

      // Only this project's photos: the controls show up only when it has several.
      const nextButton = dialog.getByRole('button', { name: 'Next photo' })
      await expect(nextButton).toHaveCount(count.total > 1 ? 1 : 0)

      const image = dialog.locator('.gallery-lightbox__image')
      await expect(image).toBeVisible()
      const box = await image.boundingBox()
      expect(box).not.toBeNull()
      const naturalRatio = await image.evaluate(
        (img: HTMLImageElement) => img.naturalWidth / img.naturalHeight,
      )
      const renderedRatio = (box?.width ?? 0) / (box?.height ?? 1)
      // Not stretched or cropped: the rendered box keeps the photo's aspect ratio.
      expect(Math.abs(renderedRatio - naturalRatio)).toBeLessThan(0.05)
      // Uses most of the viewport in at least one axis.
      const fillsWidth = (box?.width ?? 0) >= viewport.width * 0.8
      const fillsHeight = (box?.height ?? 0) >= viewport.height * 0.6
      expect(fillsWidth || fillsHeight).toBeTruthy()
      // Never overflows the viewport.
      expect(box?.width ?? 0).toBeLessThanOrEqual(viewport.width)
      expect(box?.height ?? 0).toBeLessThanOrEqual(viewport.height)

      await page.screenshot({
        path: `test-results/gallery-lightbox-${viewport.label}.png`,
        fullPage: false,
      })

      if (count.total > 1) {
        await page.keyboard.press('ArrowRight')
        expect((await parseCount(dialog)).index).toBe(2)
        await page.keyboard.press('ArrowLeft')
        expect((await parseCount(dialog)).index).toBe(1)
        await nextButton.click()
        expect((await parseCount(dialog)).index).toBe(2)
      }

      const results = await new AxeBuilder({ page })
        .include('[data-gallery-lightbox]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toStrictEqual([])

      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
      await expect(tile).toBeFocused()
      expect(pageErrors).toStrictEqual([])
    })
  }

  test('desktop: the grid matches the project count and the close button restores focus', async ({
    page,
  }) => {
    const pageErrors = collectPageErrors(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(GALLERY_PATH, { waitUntil: 'load' })
    const section = page.locator('section.gallery')
    await section.scrollIntoViewIfNeeded()
    await page.screenshot({ path: 'test-results/gallery-grid-desktop.png', fullPage: false })

    const { tile, dialog } = await openFirstProject(page, pageErrors)
    await dialog.getByRole('button', { name: 'Close gallery' }).click()
    await expect(dialog).toBeHidden()
    await expect(tile).toBeFocused()

    const results = await new AxeBuilder({ page })
      .include('section.gallery')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    expect(results.violations).toStrictEqual([])
    expect(pageErrors).toStrictEqual([])
  })
})
