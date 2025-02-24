import { describe, expect, it } from 'vitest'

import { generateRandomString } from './generateRandomString'

describe('generateRandomString', () => {
  it('should generate a string of the specified length', () => {
    const length = 10
    const result = generateRandomString(length)

    expect(result).toHaveLength(length)
  })

  it('should generate only numeric characters', () => {
    const result = generateRandomString(20)

    expect(result).toMatch(/^\d+$/)
  })

  it('should generate different strings on subsequent calls', () => {
    const length = 10
    const result1 = generateRandomString(length)
    const result2 = generateRandomString(length)

    expect(result1).not.toBe(result2)
  })

  it('should handle zero length', () => {
    const result = generateRandomString(0)

    expect(result).toBe('')
  })

  it('should handle large lengths', () => {
    const length = 1000
    const result = generateRandomString(length)

    expect(result).toHaveLength(length)
    expect(result).toMatch(/^\d+$/)
  })

  it('should generate strings with uniform distribution', () => {
    const length = 10000
    const result = generateRandomString(length)
    const counts = new Map<string, number>()

    // Count occurrences of each digit
    for (const char of result) {
      counts.set(char, (counts.get(char) || 0) + 1)
    }

    // Check if each digit appears roughly the same number of times (within 20% of expected)
    const expectedCount = length / 10 // 10 possible digits
    const tolerance = expectedCount * 0.2 // 20% tolerance

    for (const count of counts.values()) {
      expect(count).toBeGreaterThanOrEqual(expectedCount - tolerance)
      expect(count).toBeLessThanOrEqual(expectedCount + tolerance)
    }
  })
})
