import { describe, expect, it } from 'vitest'

import { isImageryStale } from '@/lib/solar-fit/google'

describe(isImageryStale, () => {
  const now = new Date('2026-11-08')

  it('is stale when the aerial photo is more than two years old', () => {
    expect(isImageryStale({ year: 2021, month: 2, day: 5 }, now)).toBeTruthy()
  })

  it('is fresh when the aerial photo is under two years old', () => {
    expect(isImageryStale({ year: 2025, month: 6, day: 1 }, now)).toBeFalsy()
  })

  it('is stale when Google gives no date', () => {
    expect(isImageryStale(undefined, now)).toBeTruthy()
  })
})
