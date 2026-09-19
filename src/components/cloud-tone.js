/**
 * Resolves the visual sky phase from a visitor's local device time.
 *
 * @param {Date} date - The visitor-local date and time.
 * @returns {'day' | 'dusk' | 'night'} The current cloud color treatment.
 */
export const getLocalCloudTone = (date) => {
  const hour = date.getHours()

  if (hour >= 7 && hour < 18) {
    return 'day'
  }

  if (hour === 5 || hour === 6 || hour === 18 || hour === 19) {
    return 'dusk'
  }

  return 'night'
}

/**
 * Calculates how long a local-time color treatment remains current.
 *
 * @param {Date} date - The visitor-local date and time.
 * @returns {number} Milliseconds until the next local hour.
 */
export const getMillisecondsUntilNextHour = (date) => {
  const nextHour = new Date(date)

  nextHour.setHours(date.getHours() + 1, 0, 0, 0)

  return nextHour.getTime() - date.getTime()
}

/**
 * Runs in <head> before first paint so the sky phase is right on the very first
 * frame. It mirrors `getLocalCloudTone`. The server cannot know the visitor's
 * clock, and reading a cookie there would stop every public page from caching.
 */
export const CLOUD_TONE_INLINE_SCRIPT = `(function(){try{var h=new Date().getHours();document.documentElement.dataset.cloudTone=h>=7&&h<18?'day':h===5||h===6||h===18||h===19?'dusk':'night'}catch(e){}})()`
