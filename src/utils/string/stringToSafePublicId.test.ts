import { describe, expect, it } from 'vitest'

import { stringToSafePublicId } from './stringToSafePublicId'

describe('stringToSafePublicId', () => {
  it('should generate consistent hashes for the same input', () => {
    const input = 'test-string'
    const hash1 = stringToSafePublicId(input)
    const hash2 = stringToSafePublicId(input)

    expect(hash1).toBe(hash2)
  })

  it('should generate different hashes for different inputs', () => {
    const hash1 = stringToSafePublicId('test-string-1')
    const hash2 = stringToSafePublicId('test-string-2')

    expect(hash1).not.toBe(hash2)
  })

  it('should handle empty strings', () => {
    const hash = stringToSafePublicId('')

    expect(hash).toBe('0')
  })

  it('should handle special characters', () => {
    const hash = stringToSafePublicId('!@#$%^&*()')

    expect(hash).toMatch(/^[0-9a-f]+$/)
  })

  it('should handle unicode characters', () => {
    const hash = stringToSafePublicId('Hello 世界')

    expect(hash).toMatch(/^[0-9a-f]+$/)
  })

  it('should generate positive hex numbers', () => {
    const inputs = ['test', 'long-string-that-might-generate-negative-hash', '!@#$%^&*()', 'Hello 世界']

    for (const input of inputs) {
      const hash = stringToSafePublicId(input)

      expect(hash).toMatch(/^[0-9a-f]+$/)
      expect(Number.parseInt(hash, 16)).toBeGreaterThanOrEqual(0)
    }
  })

  it('should be case-sensitive', () => {
    const lowerHash = stringToSafePublicId('test')
    const upperHash = stringToSafePublicId('TEST')

    expect(lowerHash).not.toBe(upperHash)
  })

  it('should handle long strings', () => {
    const longString = 'a'.repeat(1000)
    const hash = stringToSafePublicId(longString)

    expect(hash).toMatch(/^[0-9a-f]+$/)
  })
})
