import { afterEach, describe, expect, it } from 'vitest'

import { getBaseUrl } from './getBaseUrl'

describe('getBaseUrl', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it.each([
    ['production', 'myapp.vercel.app'],
    ['preview', 'preview-myapp.vercel.app'],
  ])('should return Vercel URL when in %s environment', (env, url) => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = env
    process.env.NEXT_PUBLIC_VERCEL_URL = url

    expect(getBaseUrl()).toBe(`https://${url}`)
  })

  it('should return localhost as fallback when not in Vercel environment', () => {
    process.env.NEXT_PUBLIC_VERCEL_ENV = undefined
    process.env.NEXT_PUBLIC_VERCEL_URL = undefined

    expect(getBaseUrl()).toBe('http://localhost:3000')
  })
})
