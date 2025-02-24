import { describe, expect, it } from 'vitest'

import { capitalize } from './capitalize'

describe('capitalize', () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should handle already capitalized strings', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('should handle single character strings', () => {
    expect(capitalize('a')).toBe('A')
  })

  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('')
  })

  it('should handle strings with special characters', () => {
    expect(capitalize('123abc')).toBe('123abc')
    expect(capitalize('!hello')).toBe('!hello')
  })

  it('should handle strings with spaces', () => {
    expect(capitalize('hello world')).toBe('Hello world')
    expect(capitalize(' hello')).toBe(' hello')
  })
})
