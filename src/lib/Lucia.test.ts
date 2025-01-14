import type { Cookie } from 'lucia'
import { cookies } from 'next/headers'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { lucia, validateRequest } from './Lucia'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('validateRequest', () => {
  let mockCookieStore: {
    get: Mock
    set: Mock
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Setup mock cookie store
    mockCookieStore = {
      get: vi.fn(),
      set: vi.fn(),
    }
    ;(cookies as Mock).mockReturnValue(mockCookieStore)
  })

  it('should return null user and session when no session cookie exists', async () => {
    mockCookieStore.get.mockReturnValue(null)

    const result = await validateRequest()

    expect(result).toEqual({
      user: null,
      session: null,
    })
  })

  it('should validate and return active session', async () => {
    const mockSessionId = 'valid-session-id'
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      avatar: null,
      emailVerified: 1,
      email: 'test@example.com',
    }
    const mockSession = {
      id: mockSessionId,
      userId: mockUser.id,
      fresh: false,
      user: mockUser,
      expiresAt: new Date(Date.now() + 3600000), // expires in 1 hour
    }

    mockCookieStore.get.mockReturnValue({ value: mockSessionId })
    vi.spyOn(lucia, 'validateSession').mockResolvedValue({
      session: mockSession,
      user: mockUser,
    })

    const result = await validateRequest()

    expect(result).toEqual({
      session: mockSession,
      user: mockUser,
    })
    expect(lucia.validateSession).toHaveBeenCalledWith(mockSessionId)
  })

  it('should handle fresh sessions by setting a new session cookie', async () => {
    const mockSessionId = 'fresh-session-id'
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      avatar: null,
      emailVerified: 1,
      email: 'test@example.com',
    }
    const mockSession = {
      id: mockSessionId,
      userId: mockUser.id,
      fresh: true,
      user: mockUser,
      expiresAt: new Date(Date.now() + 3600000), // expires in 1 hour
    }

    mockCookieStore.get.mockReturnValue({ value: mockSessionId })
    vi.spyOn(lucia, 'validateSession').mockResolvedValue({
      session: mockSession,
      user: mockUser,
    })
    vi.spyOn(lucia, 'createSessionCookie').mockReturnValue({
      name: 'user_session',
      value: 'new-session-cookie',
      attributes: {},
      serialize: () => 'serialized-cookie',
    } as Cookie)

    const result = await validateRequest()

    expect(result).toEqual({
      session: mockSession,
      user: mockUser,
    })
    expect(mockCookieStore.set).toHaveBeenCalled()
  })

  it('should handle invalid sessions by setting a blank session cookie', async () => {
    const mockSessionId = 'invalid-session-id'

    mockCookieStore.get.mockReturnValue({ value: mockSessionId })
    vi.spyOn(lucia, 'validateSession').mockResolvedValue({
      session: null,
      user: null,
    })
    vi.spyOn(lucia, 'createBlankSessionCookie').mockReturnValue({
      name: 'user_session',
      value: '',
      attributes: {},
      serialize: () => 'serialized-cookie',
    } as Cookie)

    const result = await validateRequest()

    expect(result).toEqual({
      session: null,
      user: null,
    })
    expect(mockCookieStore.set).toHaveBeenCalled()
  })
})
