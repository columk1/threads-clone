import { describe, expect, it } from 'vitest'

import { formatCount } from './formatCount'

describe('formatCount', () => {
  it('should return empty string for zero', () => {
    expect(formatCount(0)).toBe('')
  })

  it('should return numbers less than 1000 as is', () => {
    expect(formatCount(1)).toBe('1')
    expect(formatCount(42)).toBe('42')
    expect(formatCount(999)).toBe('999')
  })

  it('should format numbers between 1000 and 9999 with one decimal K', () => {
    expect(formatCount(1000)).toBe('1K')
    expect(formatCount(1500)).toBe('1.5K')
    expect(formatCount(9900)).toBe('9.9K')
  })

  it('should format numbers 10000 and above with no decimal K', () => {
    expect(formatCount(10000)).toBe('10K')
    expect(formatCount(15500)).toBe('16K')
    expect(formatCount(999999)).toBe('1000K')
  })

  it('should remove trailing .0 in formatted numbers', () => {
    expect(formatCount(2000)).toBe('2K')
    expect(formatCount(3000)).toBe('3K')
    expect(formatCount(4000)).toBe('4K')
  })
})
