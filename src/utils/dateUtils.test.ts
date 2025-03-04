import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatDate, getRelativeTime, timeFromNow } from './dateUtils'

describe('formatDate', () => {
  it('should format date in correct format', () => {
    const date = new Date('2024-02-24T15:30:00')

    expect(formatDate(date)).toMatch(/Feb 24, 2024(,)? \d{1,2}:30 (AM|PM)/)
  })
})

describe('getRelativeTime', () => {
  beforeEach(() => {
    // Mock current time to 2024-02-24 15:30:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-24T15:30:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should handle recent times', () => {
    const now = Date.now()

    expect(getRelativeTime(now - 30 * 1000)).toBe('now') // 30 seconds ago
    expect(getRelativeTime(now - 2 * 60 * 1000)).toBe('2m') // 2 minutes ago
    expect(getRelativeTime(now - 3 * 60 * 60 * 1000)).toBe('3h') // 3 hours ago
    expect(getRelativeTime(now - 2 * 24 * 60 * 60 * 1000)).toBe('2d') // 2 days ago
  })

  it('should handle boundary cases', () => {
    const now = Date.now()

    expect(getRelativeTime(now - 59 * 1000)).toBe('now') // Just under 1 minute
    expect(getRelativeTime(now - 59 * 60 * 1000)).toBe('59m') // Just under 1 hour
    expect(getRelativeTime(now - 23 * 60 * 60 * 1000)).toBe('23h') // Just under 1 day
  })
})

describe('timeFromNow', () => {
  beforeEach(() => {
    // Mock current time to 2024-02-24 15:30:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-24T15:30:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should format time difference correctly for future dates', () => {
    const futureDate = new Date('2024-02-24T15:31:30') // 1 minute 30 seconds in future

    expect(timeFromNow(futureDate)).toBe('1m 30s')

    const twoMinutesFuture = new Date('2024-02-24T15:32:00') // 2 minutes in future

    expect(timeFromNow(twoMinutesFuture)).toBe('2m 0s')

    const fiveMinThirtySecFuture = new Date('2024-02-24T15:35:30') // 5 minutes 30 seconds in future

    expect(timeFromNow(fiveMinThirtySecFuture)).toBe('5m 30s')
  })

  it('should handle edge cases', () => {
    const sameTime = new Date('2024-02-24T15:30:00') // Same time as current

    expect(timeFromNow(sameTime)).toBe('0m 0s')

    const justSeconds = new Date('2024-02-24T15:30:45') // Only seconds difference

    expect(timeFromNow(justSeconds)).toBe('0m 45s')

    const exactMinute = new Date('2024-02-24T15:31:00') // Exactly one minute

    expect(timeFromNow(exactMinute)).toBe('1m 0s')
  })
})
