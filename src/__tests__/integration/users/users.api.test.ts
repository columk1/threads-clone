import { testApiHandler } from 'next-test-api-route-handler'
import { describe, expect, it, vi } from 'vitest'

import { createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import { GET as followingRouteHandler } from '@/app/api/users/[userId]/following/route'
import { GET as validateRouteHandler } from '@/app/api/users/validate/route'
import { NOT_AUTHORIZED_ERROR } from '@/lib/constants'
import { validateRequest } from '@/lib/Lucia'
import { getFollowStatus } from '@/repositories/users.repository'
import { isUniqueUserField } from '@/services/users/users.queries'

// Mock dependencies
vi.mock('@/lib/Lucia', () => ({
  validateRequest: vi.fn(),
}))

vi.mock('@/services/users/users.queries', () => ({
  isUniqueUserField: vi.fn(),
}))

vi.mock('@/repositories/users.repository', () => ({
  getFollowStatus: vi.fn(),
}))

setupIntegrationTest()

describe('User API Routes', () => {
  describe('GET /api/users/validate', () => {
    it('should check if email is unique', async () => {
      const mockEmail = 'test@example.com'
      vi.mocked(isUniqueUserField).mockResolvedValueOnce(true)

      await testApiHandler({
        appHandler: {
          GET: validateRouteHandler,
        },
        url: `/api/users/validate?email=${mockEmail}`,
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(200)
          expect(json).toEqual({ isUnique: true })
          expect(isUniqueUserField).toHaveBeenCalledWith('email', mockEmail)
        },
      })
    })

    it('should check if username is unique', async () => {
      const mockUsername = 'testuser'
      vi.mocked(isUniqueUserField).mockResolvedValueOnce(false)

      await testApiHandler({
        appHandler: {
          GET: validateRouteHandler,
        },
        url: `/api/users/validate?username=${mockUsername}`,
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(200)
          expect(json).toEqual({ isUnique: false })
          expect(isUniqueUserField).toHaveBeenCalledWith('username', mockUsername)
        },
      })
    })

    it('should return 400 for invalid field', async () => {
      await testApiHandler({
        appHandler: {
          GET: validateRouteHandler,
        },
        url: '/api/users/validate',
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(400)
          expect(json).toEqual({ error: 'Invalid field.' })
        },
      })
    })
  })

  describe('GET /api/users/[userId]/following', () => {
    it('should return follow status for authenticated user', async () => {
      const testUser = await createTestUser()
      const targetUserId = 'target-user-id'

      vi.mocked(validateRequest).mockResolvedValueOnce({
        user: testUser,
        session: {
          id: 'test-session',
          userId: testUser.id,
          expiresAt: new Date(),
          fresh: true,
        },
      })
      vi.mocked(getFollowStatus).mockResolvedValueOnce(true)

      await testApiHandler({
        appHandler: {
          GET: followingRouteHandler,
        },
        params: { userId: targetUserId },
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(200)
          expect(json).toBe(true)
          expect(getFollowStatus).toHaveBeenCalledWith(targetUserId, testUser.id)
        },
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      await testApiHandler({
        appHandler: {
          GET: followingRouteHandler,
        },
        params: { userId: 'any-user-id' },
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(401)
          expect(json).toEqual({ error: NOT_AUTHORIZED_ERROR })
        },
      })
    })
  })
})
