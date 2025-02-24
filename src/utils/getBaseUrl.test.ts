import { afterEach, describe, expect, it } from 'vitest'

import { getBaseUrl } from './getBaseUrl'

describe('getBaseUrl', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('should return NEXT_PUBLIC_APP_URL when available', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com'

    expect(getBaseUrl()).toBe('https://myapp.com')
  })

  it('should return production URL when in Vercel production', () => {
    process.env.NEXT_PUBLIC_APP_URL = undefined
    process.env.VERCEL_ENV = 'production'
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp.vercel.app'

    expect(getBaseUrl()).toBe('https://myapp.vercel.app')
  })

  it('should return VERCEL_URL when available', () => {
    process.env.NEXT_PUBLIC_APP_URL = undefined
    process.env.VERCEL_ENV = undefined
    process.env.VERCEL_URL = 'myapp.vercel.app'

    expect(getBaseUrl()).toBe('https://myapp.vercel.app')
  })

  it('should return localhost as fallback', () => {
    process.env.NEXT_PUBLIC_APP_URL = undefined
    process.env.VERCEL_ENV = undefined
    process.env.VERCEL_URL = undefined

    expect(getBaseUrl()).toBe('http://localhost:3000')
  })
})
