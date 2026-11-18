/*
 * Jobber's embed snippet adds a window "message" listener each time its form
 * iframe loads, and never removes it. The listener has no origin check and
 * expects Jobber's own popup and form iframe to be on the page: "close" and
 * "scrolltop" read `.jobber-dialog-overlay`, which the inline embed never
 * renders, and every other message reads `iframe.jobber-work-request`, which
 * is gone once the quote dialog closes or the visitor moves to another page.
 * Each miss throws inside a cross-origin script, so error tracking only gets
 * "Script error." with no stack.
 *
 * The guard wraps that one listener so it only runs for messages from its own
 * iframe, and only while the elements it reads are on the page.
 */

const FRAME_SELECTOR = 'iframe.jobber-work-request'
const OVERLAY_SELECTOR = '.jobber-dialog-overlay'
const OVERLAY_MESSAGES = new Set(['close', 'scrolltop'])

let installed = false

/**
 * @param {HTMLIFrameElement} frame The Jobber form iframe the listener belongs to.
 * @param {MessageEvent} event A message posted to the window.
 * @returns {boolean} True when Jobber's listener can handle the message without throwing.
 */
const jobberListenerCanRun = (frame, event) => {
  if (!frame.isConnected || event.source !== frame.contentWindow) {
    return false
  }
  if (OVERLAY_MESSAGES.has(event.data)) {
    return document.querySelector(OVERLAY_SELECTOR) !== null
  }
  return true
}

/**
 * Wraps the message listener Jobber's snippet adds when its form iframe loads.
 * Jobber adds it from the iframe's own load listener, so window.addEventListener
 * is swapped only while that load event is dispatched to the iframe.
 */
export const installJobberMessageGuard = () => {
  if (installed) {
    return
  }
  installed = true

  document.addEventListener(
    'load',
    (loadEvent) => {
      const frame = loadEvent.target
      if (!(frame instanceof HTMLIFrameElement) || !frame.matches(FRAME_SELECTOR)) {
        return
      }
      const addListener = window.addEventListener
      window.addEventListener = function addEventListener(type, listener, options) {
        if (type !== 'message' || typeof listener !== 'function') {
          return addListener.call(this, type, listener, options)
        }
        return addListener.call(
          this,
          type,
          function guardedJobberListener(event) {
            if (jobberListenerCanRun(frame, event)) {
              listener.call(this, event)
            }
          },
          options,
        )
      }
      // Added during capture, so it runs after the iframe's own load listeners, Jobber's included.
      frame.addEventListener(
        'load',
        () => {
          window.addEventListener = addListener
        },
        { once: true },
      )
    },
    true,
  )
}
