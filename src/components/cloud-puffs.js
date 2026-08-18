/* oxlint-disable unicorn/prefer-math-trunc -- `>>> 0` coerces to unsigned 32-bit,
 * which `Math.trunc` does not do; the PRNG depends on the wraparound. */
/*
 * Procedural puff layout, after the CSS 3D cloud technique described at
 * clicktorelease.com/blog/how-to-make-clouds-with-css-3d.
 *
 * A cloud is not one sprite but a stack of them, scattered through a shallow
 * 3D volume and each rotating at its own rate. No single plane is readable on
 * its own; what the eye follows is the union of their silhouettes, which never
 * repeats because the rotation periods are mutually prime-ish. That is what
 * makes the cloud appear to billow and re-form rather than merely drift.
 */

/**
 * One draw of a deterministic PRNG. Layout must be identical on the server and
 * the client or the markup will not hydrate, so this is seeded per puff rather
 * than using `Math.random`.
 *
 * @param {number} seed - Any integer; the same seed always yields the same draw.
 * @returns {number} A value from 0 up to but excluding 1.
 */
const seededRandom = (seed) => {
  let state = (seed + 0x6d2b79f5) >>> 0

  state = Math.imul(state ^ (state >>> 15), state | 1)
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61)

  return ((state ^ (state >>> 14)) >>> 0) / 4294967296
}

/**
 * Maps a seeded draw onto a range.
 *
 * @param {number} seed - Seed for the draw.
 * @param {number} minimum - Lower bound, inclusive.
 * @param {number} maximum - Upper bound, exclusive.
 * @returns {number} A value within the range.
 */
const seededBetween = (seed, minimum, maximum) => minimum + seededRandom(seed) * (maximum - minimum)

/* Offsets are percentages of the sprite box so they track its responsive
 * width, while depth is absolute — it has to stay in scale with `perspective`. */
const SPREAD_PERCENT = 12
const DEPTH_PIXELS = 45

/**
 * Builds the puff stack for one cloud position.
 *
 * @param {string} cloudPosition - The cloud's position name, used as the seed.
 * @param {number} puffCount - How many sprite planes to stack.
 * @returns {Array<{ key: string, style: Record<string, string> }>} Puffs, back to front.
 */
export const getCloudPuffs = (cloudPosition, puffCount) => {
  /* Seed off the position name so each cloud gets its own arrangement while
   * staying stable between renders. */
  const cloudSeed = [...cloudPosition].reduce((total, character) => total * 31 + character.codePointAt(0), 7)

  return Array.from({ length: puffCount }, (_, index) => {
    const seed = cloudSeed * 977 + index * 131

    return {
      key: `${cloudPosition}-${index}`,
      style: {
        '--puff-x': `${seededBetween(seed, -SPREAD_PERCENT, SPREAD_PERCENT).toFixed(2)}%`,
        '--puff-y': `${seededBetween(seed + 1, -SPREAD_PERCENT, SPREAD_PERCENT).toFixed(2)}%`,
        '--puff-z': `${seededBetween(seed + 2, -DEPTH_PIXELS, DEPTH_PIXELS).toFixed(1)}px`,
        '--puff-scale': seededBetween(seed + 3, 0.74, 1.14).toFixed(3),
        '--puff-start': `${seededBetween(seed + 4, 0, 360).toFixed(1)}deg`,
        '--puff-opacity': seededBetween(seed + 5, 0.76, 1).toFixed(3),
        /* Deliberately unrounded and staggered: equal periods would let the
         * stack fall back into phase and visibly loop. Slow enough that no
         * single plane reads as spinning — only the union should appear to
         * move, and then barely. */
        '--puff-spin': `${seededBetween(seed + 6, 210, 430).toFixed(1)}s`,
        animationDirection: seededRandom(seed + 7) > 0.5 ? 'reverse' : 'normal',
      },
    }
  })
}
