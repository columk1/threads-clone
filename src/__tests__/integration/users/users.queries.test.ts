import type { Session } from 'lucia'
import { redirect } from 'next/navigation'
import { describe, expect, it, vi } from 'vitest'

import { createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import type { User } from '@/lib/db/Schema'
import { validateRequest } from '@/lib/Lucia'
import { getPublicUserInfo, getUserInfo, isUniqueUserField, searchUsers } from '@/services/users/users.queries'

setupIntegrationTest()

// Mock external dependencies
vi.mock('@/lib/Lucia', () => ({
  validateRequest: vi.fn().mockResolvedValue({
    user: null,
    session: null,
  } as { user: User | null; session: Session | null }),
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
    fresh: false,
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
})
