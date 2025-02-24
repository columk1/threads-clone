import { describe, expect, it } from 'vitest'

import { isTextWithinRange, isWithinRange } from './isWithinRange'

describe('isWithinRange', () => {
  it('should handle basic range checks', () => {
    // Within range
    expect(isWithinRange(5, 10, 0)).toBe(true)
    // At boundaries
    expect(isWithinRange(0, 10, 0)).toBe(true)
    expect(isWithinRange(10, 10, 0)).toBe(true)
    // Outside range
    expect(isWithinRange(-1, 10, 0)).toBe(false)
    expect(isWithinRange(11, 10, 0)).toBe(false)
  })

  it('should handle equal min and max values', () => {
    expect(isWithinRange(5, 5, 5)).toBe(true)
    expect(isWithinRange(4, 5, 5)).toBe(false)
  })

  it('should handle negative ranges', () => {
    expect(isWithinRange(-5, 0, -10)).toBe(true)
    expect(isWithinRange(-11, 0, -10)).toBe(false)
  })
})

describe('isTextWithinRange', () => {
  it('should validate text length within bounds', () => {
    // Within range
    expect(isTextWithinRange('hello', 10, 1)).toBe(true)
    // At boundaries
    expect(isTextWithinRange('h', 10, 1)).toBe(true)
    expect(isTextWithinRange('helloworld', 10, 1)).toBe(true)
    // Outside range
    expect(isTextWithinRange('', 10, 1)).toBe(false)
    expect(isTextWithinRange('helloworld!', 10, 1)).toBe(false)
  })

  it('should handle whitespace trimming', () => {
    expect(isTextWithinRange('  hello  ', 5, 1)).toBe(true)
    expect(isTextWithinRange('  hello  ', 5, 1, false)).toBe(false)
    expect(isTextWithinRange('   ', 5, 1)).toBe(false)
  })

  it('should handle custom min length', () => {
    expect(isTextWithinRange('h', 10, 2)).toBe(false)
    expect(isTextWithinRange('hi', 10, 2)).toBe(true)
    expect(isTextWithinRange('hi', 2, 2)).toBe(true)
  })
})
