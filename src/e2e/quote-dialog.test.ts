import { devices, expect, test } from '@playwright/test'

/*
 * The floating "Get a free quote" button opens the Jobber dialog. While the
 * dialog is open, its overlay covers the button. A quick second tap on a phone
 * must not close the dialog it just opened.
 */
const { defaultBrowserType: _browser, ...pixel } = devices['Pixel 7']
test.use(pixel)

test('a quick second tap on the quote button keeps the dialog open', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  // The dev-only Agentation toolbar sits over the bottom-right corner.
  await page.evaluate(() => document.querySelectorAll('agentation-toolbar').forEach((node) => node.remove()))

  const button = page.getByRole('button', { name: 'Get a free quote' })
  const box = await button.boundingBox()
  expect(box, 'quote button should render').not.toBeNull()
  const { x, y, width, height } = box as { x: number; y: number; width: number; height: number }
  const center = { x: x + width / 2, y: y + height / 2 }
  const dialog = page.getByRole('dialog', { name: 'Get a free quote' })

  await page.touchscreen.tap(center.x, center.y)
  await expect(dialog).toBeVisible()
  await page.touchscreen.tap(center.x, center.y)
  await page.waitForTimeout(1000)
  await expect(dialog).toBeVisible()

  // A tap on the overlay away from the button still closes the dialog.
  await page.touchscreen.tap(4, 4)
  await expect(dialog).toBeHidden()
})
