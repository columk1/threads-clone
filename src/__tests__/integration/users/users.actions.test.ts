import { eq } from 'drizzle-orm'
import type { Session } from 'lucia'
import { redirect } from 'next/navigation'
import { describe, expect, it, vi } from 'vitest'

import { createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import { testDb } from '@/__tests__/utils/testDb'
import { DEFAULT_ERROR } from '@/lib/constants/errors'
import { followerSchema, userSchema } from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'
import { handleFollowAction, updateAvatar, updateBio } from '@/services/users/users.actions'

setupIntegrationTest()

// Mock external dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/Lucia', () => ({
  validateRequest: vi.fn(),
}))

vi.mock('@/lib/Logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('User Actions', () => {
  const createMockSession = (userId: string): Session => ({
    id: 'session-1',
    userId,
    expiresAt: new Date(Date.now() + 3600 * 1000),
    fresh: false,
  })

  describe('updateAvatar', () => {
    it('should successfully update avatar', async () => {
      const user = await createTestUser()
      const avatarUrl = 'https://example.com/avatar.jpg'

      vi.mocked(validateRequest).mockResolvedValue({
        user,
        session: createMockSession(user.id),
      })

      const result = await updateAvatar(avatarUrl)

      expect(result).toEqual({ success: true })

      // Verify avatar was updated in DB
      const updatedUser = await testDb.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.id, user.id),
      })

      expect(updatedUser).toBeDefined()
      expect(updatedUser?.avatar).toBe(avatarUrl)
    })

    it('should handle errors', async () => {
      const user = await createTestUser()

      vi.mocked(validateRequest).mockResolvedValue({
        user,
        session: createMockSession(user.id),
      })

      const result = await updateAvatar(undefined as any)

      expect(result).toEqual({ success: false, error: 'Failed to upload image' })
      expect(logger.error).toHaveBeenCalled()
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValue({
        user: null,
        session: null,
      })

      await updateAvatar('test-url')

      expect(vi.mocked(redirect)).toHaveBeenCalledWith('/login')
    })
  })

  describe('handleFollowAction', () => {
    it('should successfully follow a user and create a notification', async () => {
      const follower = await createTestUser()
      const target = await createTestUser()

      vi.mocked(validateRequest).mockResolvedValue({
        user: follower,
        session: createMockSession(follower.id),
      })

      const result = await handleFollowAction(target.id, 'follow')

      expect(result).toEqual({ success: 'Followed' })

      // Verify follow was created in DB
      const follows = await testDb.query.followerSchema.findMany({
        where: (followers, { and, eq }) => and(eq(followers.userId, target.id), eq(followers.followerId, follower.id)),
      })

      expect(follows).toHaveLength(1)

      // Verify follower count was incremented
      const updatedTarget = await testDb.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.id, target.id),
      })

      expect(updatedTarget).toBeDefined()
      expect(updatedTarget?.followerCount).toBe(1)

      // Verify notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.userId, target.id),
            eq(notifications.type, 'FOLLOW'),
            eq(notifications.sourceUserId, follower.id),
          ),
      })

      expect(notifications).toHaveLength(1)
    })

    it('should successfully unfollow a user without creating a notification', async () => {
      const follower = await createTestUser()
      const target = await createTestUser()

      // First create a follow
      await testDb.insert(followerSchema).values({
        userId: target.id,
        followerId: follower.id,
      })

      // Update follower count
      await testDb.update(userSchema).set({ followerCount: 1 }).where(eq(userSchema.id, target.id))

      vi.mocked(validateRequest).mockResolvedValue({
        user: follower,
        session: createMockSession(follower.id),
      })

      const result = await handleFollowAction(target.id, 'unfollow')

      expect(result).toEqual({ success: 'Unfollowed' })

      // Verify follow was removed from DB
      const follows = await testDb.query.followerSchema.findMany({
        where: (followers, { and, eq }) => and(eq(followers.userId, target.id), eq(followers.followerId, follower.id)),
      })

      expect(follows).toHaveLength(0)

      // Verify follower count was decremented
      const updatedTarget = await testDb.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.id, target.id),
      })

      expect(updatedTarget).toBeDefined()
      expect(updatedTarget?.followerCount).toBe(0)

      // Verify no new notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.userId, target.id),
            eq(notifications.type, 'FOLLOW'),
            eq(notifications.sourceUserId, follower.id),
          ),
      })

      expect(notifications).toHaveLength(0)
    })

    it('should handle invalid user ID', async () => {
      const follower = await createTestUser()

      vi.mocked(validateRequest).mockResolvedValue({
        user: follower,
        session: createMockSession(follower.id),
      })

      const result = await handleFollowAction('invalid-id', 'follow')

      expect(result).toEqual({ error: DEFAULT_ERROR })
      expect(logger.error).toHaveBeenCalled()
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValue({
        user: null,
        session: null,
      })

      await handleFollowAction('some-id', 'follow')

      expect(vi.mocked(redirect)).toHaveBeenCalledWith('/login')
    })
  })

  describe('updateBio', () => {
    it('should successfully update bio', async () => {
      const testUser = await createTestUser()
      vi.mocked(validateRequest).mockResolvedValue({
        user: testUser,
        session: createMockSession(testUser.id),
      })

      const formData = new FormData()
      formData.append('bio', 'New test bio')

      const result = await updateBio(null, formData)

      expect(result).toEqual({ success: true })

      // Verify bio was updated in database
      const updatedUser = await testDb.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.id, testUser.id),
      })

      expect(updatedUser?.bio).toBe('New test bio')
    })

    it('should handle bio exceeding max length', async () => {
      const testUser = await createTestUser()
      vi.mocked(validateRequest).mockResolvedValue({
        user: testUser,
        session: createMockSession(testUser.id),
      })

      const formData = new FormData()
      formData.append('bio', 'a'.repeat(151)) // Bio limit is 150 chars

      const result = await updateBio(null, formData)

      expect(result).toHaveProperty('error')

      // Verify bio was not updated
      const user = await testDb.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.id, testUser.id),
      })

      expect(user?.bio).toBeNull()
    })

    it('should handle empty bio', async () => {
      const testUser = await createTestUser()
      vi.mocked(validateRequest).mockResolvedValue({
        user: testUser,
        session: createMockSession(testUser.id),
      })

      const formData = new FormData()
      formData.append('bio', '')

      const result = await updateBio(null, formData)

      expect(result).toHaveProperty('error')

      // Verify bio was not updated
      const user = await testDb.query.userSchema.findFirst({
        where: (users, { eq }) => eq(users.id, testUser.id),
      })

      expect(user?.bio).toBeNull()
    })

    it('should handle unauthorized user', async () => {
      vi.mocked(validateRequest).mockResolvedValue({ user: null, session: null })

      const formData = new FormData()
      formData.append('bio', 'Test bio')

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })
})
