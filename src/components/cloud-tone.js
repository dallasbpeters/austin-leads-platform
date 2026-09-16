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

/** Cookie the visitor's browser writes so the server can stamp the sky phase in the first HTML. */
export const CLOUD_TONE_COOKIE = 'cloud-tone'

export const CLOUD_TONES = ['day', 'dusk', 'night']

/**
 * Validates a stored sky phase.
 *
 * @param {string | undefined} value - Raw cookie value.
 * @returns {'day' | 'dusk' | 'night' | null} The phase, or null when unusable.
 */
export const normalizeCloudTone = (value) => (CLOUD_TONES.includes(value) ? value : null)
