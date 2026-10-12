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

// Sizes the lightbox photo must fill (phones, laptop, desktop, large monitor).
const LIGHTBOX_FILL_SIZES = [
  { width: 375, height: 812 },
  { width: 414, height: 896 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2184, height: 1584 },
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

  // Retina screens (deviceScaleFactor 2) are where the photo used to shrink: a
  // global `[role='dialog'] img` revert in base.css let the downloaded file's own
  // pixel size win. Size must come from the viewport, at every density.
  for (const size of LIGHTBOX_FILL_SIZES) {
    test(`${size.width}x${size.height} @2x: the photo fills the lightbox`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        deviceScaleFactor: 2,
      })
      const page = await context.newPage()
      const pageErrors = collectPageErrors(page)
      await page.goto(GALLERY_PATH, { waitUntil: 'load' })
      const { dialog } = await openFirstProject(page, pageErrors)
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()

      // Every project: a square cover hits the height cap either way, so only
      // the wide photos showed the bug.
      const tiles = page.locator('.gallery__tile')
      const tileCount = await tiles.count()
      for (let index = 0; index < tileCount; index += 1) {
        const tile = tiles.nth(index)
        await tile.scrollIntoViewIfNeeded()
        await tile.click()
        await expect(dialog).toBeVisible()
        const image = dialog.locator('.gallery-lightbox__image')
        await expect
          .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
          .toBe(true)

        const fill = await image.evaluate((img: HTMLImageElement) => {
          const content = img.closest('.gallery-lightbox__content') as HTMLElement
          const styles = getComputedStyle(content)
          const caption = content.querySelector('.gallery-lightbox__caption')
          const captionSpace = caption
            ? caption.getBoundingClientRect().height +
              Number.parseFloat(getComputedStyle(caption).marginBlockStart)
            : 0
          const availableHeight =
            content.clientHeight -
            Number.parseFloat(styles.paddingBlockStart) -
            Number.parseFloat(styles.paddingBlockEnd) -
            captionSpace
          const box = img.getBoundingClientRect()
          return { width: box.width, height: box.height, availableHeight }
        })
        expect(
          fill.width >= size.width * 0.7 || fill.height >= fill.availableHeight * 0.7,
          `project ${index + 1}: photo ${Math.round(fill.width)}x${Math.round(fill.height)} in ${size.width}x${size.height} (available height ${Math.round(fill.availableHeight)})`,
        ).toBeTruthy()
        expect(fill.width).toBeLessThanOrEqual(size.width)
        expect(fill.height).toBeLessThanOrEqual(size.height)

        await page.keyboard.press('Escape')
        await expect(dialog).toBeHidden()
      }
      expect(pageErrors).toStrictEqual([])
      await context.close()
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
