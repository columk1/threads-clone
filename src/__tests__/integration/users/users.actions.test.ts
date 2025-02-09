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
import { handleFollowAction, updateAvatar } from '@/services/users/users.actions'

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
      expect(updatedUser!.avatar).toBe(avatarUrl)
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
    it('should successfully follow a user', async () => {
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
      expect(updatedTarget!.followerCount).toBe(1)
    })

    it('should successfully unfollow a user', async () => {
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
      expect(updatedTarget!.followerCount).toBe(0)
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
})
