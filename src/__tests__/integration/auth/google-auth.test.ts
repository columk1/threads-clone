import type { OAuth2Tokens } from 'arctic'
import { decodeIdToken } from 'arctic'
import { eq } from 'drizzle-orm'
import { testApiHandler } from 'next-test-api-route-handler'
import { vi } from 'vitest'

import { createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import { GET } from '@/app/api/login/google/callback/route'
import { db } from '@/lib/db/Drizzle'
import { deleteUser, getUserByGoogleId } from '@/lib/db/queries'
import { sessionSchema } from '@/lib/db/Schema'
import { google } from '@/lib/oauth'

setupIntegrationTest()

// Mock arctic
vi.mock('arctic', async () => {
  const actual = await vi.importActual('arctic')
  return {
    ...actual,
    decodeIdToken: vi.fn(),
  }
})

// Mock the Google OAuth client
vi.mock('@/lib/oauth', () => ({
  google: {
    validateAuthorizationCode: vi.fn(),
  },
}))

// Mock logger
vi.mock('@/lib/Logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

const mockGoogleClaims = {
  sub: '12345',
  given_name: 'John',
  family_name: 'Doe',
  email: 'john.doe@gmail.com',
  picture: 'https://example.com/photo.jpg',
}

describe('Google OAuth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(decodeIdToken).mockReturnValue(mockGoogleClaims)
    vi.mocked(google.validateAuthorizationCode).mockResolvedValue({
      idToken: () => 'mock_id_token',
      accessToken: () => 'mock_access_token',
    } as OAuth2Tokens)
  })

  afterEach(async () => {
    // Find and delete any users created during the test
    const user = await getUserByGoogleId(mockGoogleClaims.sub)
    if (user?.id) {
      await deleteUser(user.id)
    }
  })

  it('should create a new user from Google claims', async () => {
    await testApiHandler({
      appHandler: { GET },
      url: '/api/login/google/callback?code=test_code&state=test_state',
      test: async ({ fetch }) => {
        // Set up cookies for state validation
        const res = await fetch({
          headers: {
            cookie: 'google_oauth_state=test_state; google_code_verifier=test_verifier',
          },
        })

        // Verify response
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe('/')

        // Verify user creation
        const user = await getUserByGoogleId(mockGoogleClaims.sub)

        expect(user).toBeDefined()

        if (!user?.id) {
          throw new Error('User not found')
        }

        expect(user.email).toBe(mockGoogleClaims.email)
        expect(user.name).toBe(`${mockGoogleClaims.given_name} ${mockGoogleClaims.family_name}`)
        expect(user.avatar).toBe(mockGoogleClaims.picture)
        expect(user.emailVerified).toBe(1)

        // Verify session creation
        const session = await db.query.sessionSchema.findFirst({
          where: eq(sessionSchema.userId, user.id),
        })

        expect(session).toBeDefined()
      },
    })
  })

  it('should handle existing user login', async () => {
    // Create an existing user first
    const existingUser = await createTestUser({
      googleId: mockGoogleClaims.sub,
      email: mockGoogleClaims.email,
    })

    await testApiHandler({
      appHandler: { GET },
      url: '/api/login/google/callback?code=test_code&state=test_state',
      test: async ({ fetch }) => {
        const res = await fetch({
          headers: {
            cookie: 'google_oauth_state=test_state; google_code_verifier=test_verifier',
          },
        })

        // Verify response
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe('/')

        // Verify session creation for existing user
        const session = await db.query.sessionSchema.findFirst({
          where: eq(sessionSchema.userId, existingUser.id),
        })

        expect(session).toBeDefined()
      },
    })
  })

  it('should handle username collisions', async () => {
    // Create a user with the base username first
    const usernamePart = mockGoogleClaims.email.split('@')[0]
    if (!usernamePart) {
      throw new Error('Failed to create username for test')
    }
    const existingUsername = usernamePart.toLowerCase()
    await createTestUser({
      username: existingUsername,
    })

    await testApiHandler({
      appHandler: { GET },
      url: '/api/login/google/callback?code=test_code&state=test_state',
      test: async ({ fetch }) => {
        const res = await fetch({
          headers: {
            cookie: 'google_oauth_state=test_state; google_code_verifier=test_verifier',
          },
        })

        // Verify response
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe('/')

        // Verify user was created with a modified username
        const user = await getUserByGoogleId(mockGoogleClaims.sub)

        expect(user).toBeDefined()

        if (!user?.id) {
          throw new Error('User not found')
        }

        expect(user.username).not.toBe(existingUsername)
        expect(user.username).toMatch(new RegExp(`^${existingUsername}\\d+$`))
      },
    })
  })

  it('should handle missing or invalid state', async () => {
    await testApiHandler({
      appHandler: { GET },
      url: '/api/login/google/callback?code=test_code&state=invalid_state',
      test: async ({ fetch }) => {
        const res = await fetch()

        expect(res.status).toBe(400)
      },
    })
  })

  it('should handle OAuth validation errors', async () => {
    // Mock OAuth validation to throw error
    vi.mocked(google.validateAuthorizationCode).mockRejectedValue(new Error('Invalid code'))

    await testApiHandler({
      appHandler: { GET },
      url: '/api/login/google/callback?code=invalid_code&state=test_state',
      test: async ({ fetch }) => {
        const res = await fetch({
          headers: {
            cookie: 'google_oauth_state=test_state; google_code_verifier=test_verifier',
          },
        })

        expect(res.status).toBe(400)
      },
    })
  })
})
