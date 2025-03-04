import { redirect } from 'next/navigation'
import { describe, expect, it, vi } from 'vitest'

import { createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import type { Session } from '@/lib/db/Schema'
import { type SessionValidationResult, validateRequest } from '@/lib/Session'
import { handleFollowAction } from '@/services/users/users.actions'
import {
  getNotifications,
  getPublicUserInfo,
  getUnseenNotificationsCount,
  getUserInfo,
  isUniqueUserField,
  markNotificationsAsSeen,
  searchUsers,
} from '@/services/users/users.queries'

setupIntegrationTest()

// Mock external dependencies
vi.mock('@/lib/Session', () => ({
  validateRequest: vi.fn().mockResolvedValue({
    user: null,
    session: null,
  } as SessionValidationResult),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/Logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('User Queries', () => {
  const createMockSession = (userId: string): Session => ({
    id: 'session-1',
    userId,
    expiresAt: new Date(Date.now() + 3600 * 1000),
  })

  describe('isUniqueUserField', () => {
    it('should return true for unique email', async () => {
      const result = await isUniqueUserField('email', 'unique@example.com')

      expect(result).toBe(true)
    })

    it('should return false for existing email', async () => {
      const user = await createTestUser()
      const result = await isUniqueUserField('email', user.email)

      expect(result).toBe(false)
    })

    it('should return true for unique username', async () => {
      const result = await isUniqueUserField('username', 'uniqueuser123')

      expect(result).toBe(true)
    })

    it('should return false for existing username', async () => {
      const user = await createTestUser()
      const result = await isUniqueUserField('username', user.username)

      expect(result).toBe(false)
    })
  })

  describe('getUserInfo', () => {
    it('should return user info for authenticated user', async () => {
      // Arrange
      const requestingUser = await createTestUser()
      const targetUser = await createTestUser()

      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })

      // Act
      const result = await getUserInfo(targetUser.username)

      // Assert
      expect(result).toBeDefined()
      expect('user' in result).toBe(true)

      const userInfo = (result as { user: any }).user

      expect(userInfo.username).toBe(targetUser.username)
      expect(userInfo.name).toBe(targetUser.name)
      expect(userInfo.avatar).toBe(targetUser.avatar)
      expect(userInfo.bio).toBe(targetUser.bio)
      expect(userInfo.followerCount).toBe(targetUser.followerCount)
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({
        user: null,
        session: null,
      })

      await getUserInfo('testuser')

      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should return error when requested user does not exist', async () => {
      // Arrange
      const requestingUser = await createTestUser()
      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })

      // Act
      const result = await getUserInfo('nonexistent-username')

      // Assert
      expect(result).toEqual({ error: 'User not found' })
    })

    it('should return error when database operation fails', async () => {
      // Arrange
      const requestingUser = await createTestUser()
      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })

      // Act
      const result = await getUserInfo(undefined as any)

      // Assert
      expect(result).toEqual({ error: 'Failed to fetch user info' })
    })
  })

  describe('getPublicUserInfo', () => {
    it('should return public user info', async () => {
      const user = await createTestUser()
      const result = await getPublicUserInfo(user.username)

      expect(result).toBeDefined()
      expect('user' in result).toBe(true)

      const userInfo = (result as { user: any }).user

      expect(userInfo.id).toBe(user.id)
      expect(userInfo.username).toBe(user.username)
      expect(userInfo.name).toBe(user.name)
      expect(userInfo.avatar).toBe(user.avatar)
      expect(userInfo.bio).toBe(user.bio)
      expect(userInfo.followerCount).toBe(user.followerCount)
    })

    it('should return error for non-existent user', async () => {
      const result = await getPublicUserInfo('nonexistentuser')

      expect(result).toEqual({ error: 'User not found' })
    })
  })

  describe('searchUsers', () => {
    it('should return matching users', async () => {
      const user1 = await createTestUser({ username: 'testuser1', name: 'Test User 1' })
      const user2 = await createTestUser({ username: 'testuser2', name: 'Test User 2' })
      await createTestUser({ username: 'otheruser', name: 'Other User' })

      const result = await searchUsers('test')

      expect(result).toBeDefined()
      expect(result.users).toBeDefined()

      const users = result.users!

      expect(users).toHaveLength(2)
      expect(users.map((u) => u.id).sort()).toEqual([user1.id, user2.id].sort())
    })

    it('should return empty array when no matches found', async () => {
      const result = await searchUsers('nonexistentuser')

      expect(result).toBeDefined()
      expect(result.users).toBeDefined()
      expect(result.users!).toHaveLength(0)
    })

    it('should handle empty search query', async () => {
      const result = await searchUsers('')

      expect(result).toBeDefined()
      expect(result.users).toBeDefined()
      expect(result.users!).toHaveLength(0)
    })
  })

  describe('getNotifications', () => {
    it('should return notifications for authenticated user', async () => {
      const requestingUser = await createTestUser()
      const sourceUser = await createTestUser()

      // Create a follow notification by having sourceUser follow requestingUser
      vi.mocked(validateRequest).mockResolvedValue({
        user: sourceUser,
        session: createMockSession(sourceUser.id),
      })
      await handleFollowAction(requestingUser.id, 'follow')

      // Attempt to create duplicate notification (should not create one)
      await handleFollowAction(requestingUser.id, 'unfollow')
      await handleFollowAction(requestingUser.id, 'follow')

      // Switch to requesting user for getting notifications
      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })
      const result = await getNotifications()

      if ('error' in result) {
        throw new Error('Expected notifications but got error')
      }

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1) // Should only have one notification despite multiple follow actions

      const notification = result[0]
      if (!notification) {
        throw new Error('Expected at least one notification')
      }

      expect(notification.notification.userId).toBe(requestingUser.id)
      expect(notification.notification.type).toBe('FOLLOW')
      expect(notification.notification.sourceUserId).toBe(sourceUser.id)
      expect(notification.notification.seen).toBe(false)
      expect(notification.sourceUser.id).toBe(sourceUser.id)
    })

    it('should return only unseen notifications when specified', async () => {
      const requestingUser = await createTestUser()
      const sourceUser = await createTestUser()

      // Create initial notification
      vi.mocked(validateRequest).mockResolvedValue({
        user: sourceUser,
        session: createMockSession(sourceUser.id),
      })
      await handleFollowAction(requestingUser.id, 'follow')

      // Mark as seen
      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })
      await markNotificationsAsSeen()

      // Create new notification from different user (this should create a new notification)
      const anotherSourceUser = await createTestUser()
      vi.mocked(validateRequest).mockResolvedValue({
        user: anotherSourceUser,
        session: createMockSession(anotherSourceUser.id),
      })
      await handleFollowAction(requestingUser.id, 'follow')

      // Get unseen notifications
      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })
      const result = await getNotifications({ seen: false })

      if ('error' in result) {
        throw new Error('Expected notifications but got error')
      }

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1) // Should only have one unseen notification
      expect(result.every((n) => !n.notification.seen)).toBe(true)
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValue({ user: null, session: null })

      await getNotifications()

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('getUnseenNotificationsCount', () => {
    it('should return count of unseen notifications', async () => {
      const requestingUser = await createTestUser()
      const sourceUser = await createTestUser()
      const anotherSourceUser = await createTestUser()

      // Create notifications from different users
      vi.mocked(validateRequest).mockResolvedValue({
        user: sourceUser,
        session: createMockSession(sourceUser.id),
      })
      await handleFollowAction(requestingUser.id, 'follow')

      vi.mocked(validateRequest).mockResolvedValue({
        user: anotherSourceUser,
        session: createMockSession(anotherSourceUser.id),
      })
      await handleFollowAction(requestingUser.id, 'follow')

      // Get count
      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })
      const result = await getUnseenNotificationsCount()

      if (typeof result === 'number') {
        expect(result).toBe(2) // Should have exactly 2 notifications (one from each source user)
      } else {
        throw new TypeError('Expected number but got error')
      }
    })

    it('should return zero when all notifications are seen', async () => {
      const requestingUser = await createTestUser()
      const sourceUser = await createTestUser()

      // Create notification
      vi.mocked(validateRequest).mockResolvedValue({
        user: sourceUser,
        session: createMockSession(sourceUser.id),
      })
      await handleFollowAction(requestingUser.id, 'follow')

      // Try to create duplicate notification (should not create one)
      await handleFollowAction(requestingUser.id, 'unfollow')
      await handleFollowAction(requestingUser.id, 'follow')

      // Mark as seen
      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })
      await markNotificationsAsSeen()

      // Get count
      const result = await getUnseenNotificationsCount()

      if (typeof result === 'number') {
        expect(result).toBe(0)
      } else {
        throw new TypeError('Expected number but got error')
      }
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValue({ user: null, session: null })

      await getUnseenNotificationsCount()

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('markNotificationsAsSeen', () => {
    it('should mark all notifications as seen', async () => {
      const requestingUser = await createTestUser()
      const sourceUser = await createTestUser()
      const anotherSourceUser = await createTestUser()

      // Create notifications from different users
      vi.mocked(validateRequest).mockResolvedValue({
        user: sourceUser,
        session: createMockSession(sourceUser.id),
      })
      await handleFollowAction(requestingUser.id, 'follow')

      vi.mocked(validateRequest).mockResolvedValue({
        user: anotherSourceUser,
        session: createMockSession(anotherSourceUser.id),
      })
      await handleFollowAction(requestingUser.id, 'follow')

      // Mark as seen
      vi.mocked(validateRequest).mockResolvedValue({
        user: requestingUser,
        session: createMockSession(requestingUser.id),
      })
      await markNotificationsAsSeen()

      // Verify all notifications are seen
      const notifications = await getNotifications()

      if (!('error' in notifications)) {
        expect(Array.isArray(notifications)).toBe(true)
        expect(notifications.length).toBe(2) // Should have exactly 2 notifications
        expect(notifications.every((n) => n.notification.seen)).toBe(true)
      } else {
        throw new Error('Expected notifications but got error')
      }
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValue({ user: null, session: null })

      await markNotificationsAsSeen()

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })
})
