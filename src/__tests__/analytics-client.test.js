// @vitest-environment jsdom
import posthog from 'posthog-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { trackAnalyticsEvent } from '@/lib/analytics/client'

vi.mock(import('posthog-js'), () => ({ default: { capture: vi.fn() } }))

function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state })
  document.dispatchEvent(new Event('visibilitychange'))
}

describe(trackAnalyticsEvent, () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'requestAnimationFrame'] })
    window.gtag = () => {}
    vi.spyOn(window, 'gtag')
    window.dataLayer = []
    vi.mocked(posthog.capture).mockClear()
  })

  afterEach(() => {
    vi.runAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
    delete window.gtag
    delete window.dataLayer
  })

  it('sends to PostHog at once and to Google only after the next frame', () => {
    trackAnalyticsEvent('ui_button_click', { button_label: 'Decline' })

    expect(posthog.capture).toHaveBeenCalledWith('ui_button_click', { button_label: 'Decline' })
    expect(window.gtag).not.toHaveBeenCalled()
    expect(window.dataLayer).toHaveLength(0)

    vi.runAllTimers()

    expect(window.gtag).toHaveBeenCalledWith('event', 'ui_button_click', { button_label: 'Decline' })
    expect(window.dataLayer).toStrictEqual([{ event: 'ui_button_click', button_label: 'Decline' }])
  })

  it('keeps the order of events tracked in the same frame', () => {
    trackAnalyticsEvent('ui_button_click')
    trackAnalyticsEvent('lead_form_dialog_opened')
    vi.runAllTimers()

    expect(window.gtag.mock.calls.map((call) => call[1])).toStrictEqual([
      'ui_button_click',
      'lead_form_dialog_opened',
    ])
  })

  it('sends queued events to Google when the page is hidden', () => {
    trackAnalyticsEvent('hero_cta_click')
    setVisibility('hidden')

    expect(window.gtag).toHaveBeenCalledOnce()
    setVisibility('visible')
  })
})
