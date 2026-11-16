// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { installJobberMessageGuard } from '@/lib/platform/jobber-message-guard'

const listeners = []

// The snippet adds its window message listener from the form iframe's load listener.
const loadJobberFrame = async () => {
  const listener = vi.fn()
  listeners.push(listener)
  const frame = document.createElement('iframe')
  frame.className = 'jobber-work-request'
  const loaded = new Promise((resolve) => {
    frame.addEventListener('load', () => resolve(window.addEventListener('message', listener, false)), {
      once: true,
    })
  })
  document.body.append(frame)
  await loaded
  return { frame, listener }
}

const post = (data, source) => window.dispatchEvent(new MessageEvent('message', { data, source }))

describe(installJobberMessageGuard, () => {
  beforeAll(() => installJobberMessageGuard())

  afterEach(() => {
    for (const listener of listeners.splice(0)) {
      window.removeEventListener('message', listener)
    }
    document.body.replaceChildren()
  })

  it('passes height messages from the form iframe to Jobber', async () => {
    const { frame, listener } = await loadJobberFrame()
    post('640px', frame.contentWindow)
    expect(listener).toHaveBeenCalledOnce()
  })

  it('skips messages from other windows', async () => {
    const { listener } = await loadJobberFrame()
    post({ type: 'resize' }, window)
    expect(listener).not.toHaveBeenCalled()
  })

  it('skips messages once the form iframe leaves the page', async () => {
    const { frame, listener } = await loadJobberFrame()
    const source = frame.contentWindow
    frame.remove()
    post('640px', source)
    expect(listener).not.toHaveBeenCalled()
  })

  it('skips close and scrolltop when there is no Jobber popup overlay', async () => {
    const { frame, listener } = await loadJobberFrame()
    post('scrolltop', frame.contentWindow)
    post('close', frame.contentWindow)
    expect(listener).not.toHaveBeenCalled()

    const overlay = document.createElement('div')
    overlay.className = 'jobber-dialog-overlay'
    document.body.append(overlay)
    post('scrolltop', frame.contentWindow)
    expect(listener).toHaveBeenCalledOnce()
  })

  it('restores window.addEventListener after the load event', async () => {
    await loadJobberFrame()
    const other = vi.fn()
    window.addEventListener('message', other)
    post('hello', window)
    window.removeEventListener('message', other)
    expect(other).toHaveBeenCalledOnce()
  })
})
