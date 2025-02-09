import { testApiHandler } from 'next-test-api-route-handler'
import { describe, expect, it, vi } from 'vitest'

import { createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import { GET as notificationsRouteHandler } from '@/app/api/notifications/route'
import { NOT_AUTHORIZED_ERROR, SERVER_ERROR } from '@/lib/constants'
import { validateRequest } from '@/lib/Lucia'
import type { Notification } from '@/repositories/users.repository'
import { getNotifications, getUnseenNotificationsCount } from '@/repositories/users.repository'

// Mock dependencies
vi.mock('@/lib/Lucia', () => ({
  validateRequest: vi.fn(),
}))

vi.mock('@/repositories/users.repository', () => ({
  getNotifications: vi.fn(),
  getUnseenNotificationsCount: vi.fn(),
}))

vi.mock('@/lib/Logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

setupIntegrationTest()

describe('Notifications API Routes', () => {
  const createMockNotification = (userId: string): Notification => ({
    notification: {
      id: '1',
      userId,
      type: 'FOLLOW' as const,
      sourceUserId: 'source-user-id',
      postId: null,
      replyId: null,
      seen: false,
      createdAt: Date.now(),
    },
    sourceUser: {
      id: 'source-user-id',
      username: 'sourceuser',
      name: 'Source User',
      avatar: null,
      bio: null,
      followerCount: 0,
      isFollowed: false,
      isFollower: false,
    },
    post: null,
    reply: null,
  })

  describe('GET /api/notifications', () => {
    it('should return notifications for authenticated user', async () => {
      // Arrange
      const testUser = await createTestUser()
      const mockNotifications = [createMockNotification(testUser.id)]

      vi.mocked(validateRequest).mockResolvedValueOnce({
        user: testUser,
        session: {
          id: 'test-session',
          userId: testUser.id,
          expiresAt: new Date(),
          fresh: true,
        },
      })
      vi.mocked(getNotifications).mockResolvedValueOnce(mockNotifications)

      await testApiHandler({
        appHandler: {
          GET: notificationsRouteHandler,
        },
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(200)
          expect(json.notifications).toEqual(mockNotifications)
          expect(getNotifications).toHaveBeenCalledWith(testUser.id, { seen: undefined })
        },
      })
    })

    it('should return unseen notifications count when count=true&unseen=true', async () => {
      // Arrange
      const testUser = await createTestUser()
      const mockCount = 5

      vi.mocked(validateRequest).mockResolvedValueOnce({
        user: testUser,
        session: {
          id: 'test-session',
          userId: testUser.id,
          expiresAt: new Date(),
          fresh: true,
        },
      })
      vi.mocked(getUnseenNotificationsCount).mockResolvedValueOnce(mockCount)

      await testApiHandler({
        appHandler: {
          GET: notificationsRouteHandler,
        },
        url: '/api/notifications?count=true&unseen=true',
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(200)
          expect(json.count).toBe(mockCount)
          expect(getUnseenNotificationsCount).toHaveBeenCalledWith(testUser.id)
        },
      })
    })

    it('should return total notifications count when count=true', async () => {
      // Arrange
      const testUser = await createTestUser()
      const mockNotifications = Array(3).fill(createMockNotification(testUser.id))

      vi.mocked(validateRequest).mockResolvedValueOnce({
        user: testUser,
        session: {
          id: 'test-session',
          userId: testUser.id,
          expiresAt: new Date(),
          fresh: true,
        },
      })
      vi.mocked(getNotifications).mockResolvedValueOnce(mockNotifications)

      await testApiHandler({
        appHandler: {
          GET: notificationsRouteHandler,
        },
        url: '/api/notifications?count=true',
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(200)
          expect(json.count).toBe(mockNotifications.length)
          expect(getNotifications).toHaveBeenCalledWith(testUser.id)
        },
      })
    })

    it('should return only unseen notifications when unseen=true', async () => {
      // Arrange
      const testUser = await createTestUser()
      const mockNotifications = [createMockNotification(testUser.id)]

      vi.mocked(validateRequest).mockResolvedValueOnce({
        user: testUser,
        session: {
          id: 'test-session',
          userId: testUser.id,
          expiresAt: new Date(),
          fresh: true,
        },
      })
      vi.mocked(getNotifications).mockResolvedValueOnce(mockNotifications)

      await testApiHandler({
        appHandler: {
          GET: notificationsRouteHandler,
        },
        url: '/api/notifications?unseen=true',
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(200)
          expect(json.notifications).toEqual(mockNotifications)
          expect(getNotifications).toHaveBeenCalledWith(testUser.id, { seen: false })
        },
      })
    })

    it('should return 401 for unauthenticated user', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      await testApiHandler({
        appHandler: {
          GET: notificationsRouteHandler,
        },
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(401)
          expect(json).toEqual({ error: NOT_AUTHORIZED_ERROR })
        },
      })
    })

    it('should handle server errors gracefully', async () => {
      // Arrange
      const testUser = await createTestUser()
      vi.mocked(validateRequest).mockResolvedValueOnce({
        user: testUser,
        session: {
          id: 'test-session',
          userId: testUser.id,
          expiresAt: new Date(),
          fresh: true,
        },
      })
      vi.mocked(getNotifications).mockRejectedValueOnce(new Error('Database error'))

      await testApiHandler({
        appHandler: {
          GET: notificationsRouteHandler,
        },
        test: async ({ fetch }) => {
          const res = await fetch()
          const json = await res.json()

          expect(res.status).toBe(500)
          expect(json).toEqual({ error: SERVER_ERROR })
        },
      })
    })
  })
})
