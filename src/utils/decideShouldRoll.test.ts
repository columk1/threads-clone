import { describe, expect, it } from 'vitest'

import { decideShouldRoll } from './decideShouldRoll'

describe('decideShouldRoll', () => {
  it('should handle single item case', () => {
    expect(decideShouldRoll(false, 1)).toBe(true)
    expect(decideShouldRoll(true, 1)).toBe(false)
  })

  it('should handle counts between 1 and 1000', () => {
    expect(decideShouldRoll(false, 2)).toBe(true)
    expect(decideShouldRoll(true, 2)).toBe(true)
    expect(decideShouldRoll(false, 999)).toBe(true)
    expect(decideShouldRoll(true, 999)).toBe(true)
  })

  it('should handle multiples of 100 when isSet is true', () => {
    expect(decideShouldRoll(true, 1000)).toBe(true)
    expect(decideShouldRoll(true, 1100)).toBe(true)
    expect(decideShouldRoll(true, 2000)).toBe(true)
  })

  it('should handle counts ending in 99 when isSet is false', () => {
    expect(decideShouldRoll(false, 1099)).toBe(true)
    expect(decideShouldRoll(false, 1199)).toBe(true)
    expect(decideShouldRoll(false, 2099)).toBe(true)
  })

  it('should return false for edge cases', () => {
    expect(decideShouldRoll(true, 0)).toBe(false)
    expect(decideShouldRoll(false, 0)).toBe(false)
    expect(decideShouldRoll(true, 1001)).toBe(false)
    expect(decideShouldRoll(false, 1001)).toBe(false)
  })
})
