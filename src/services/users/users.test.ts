import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_ERROR } from '@/lib/constants/errors'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'
import type { FollowActionType } from '@/lib/schemas/zod.schema'
import {
  findUserByField,
  getAuthUserDetails,
  getPublicUserDetails,
  handleFollow,
  updateUserAvatar,
} from '@/repositories/users.repository'

import { handleFollowAction, updateAvatar } from './users.actions'
import { getPublicUserInfo, getUserInfo, isUniqueUserField } from './users.queries'

// Mock all external dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/repositories/users.repository', () => ({
  handleFollow: vi.fn(),
  updateUserAvatar: vi.fn(),
  findUserByField: vi.fn(),
  getAuthUserDetails: vi.fn(),
  getPublicUserDetails: vi.fn(),
}))

vi.mock('@/lib/Lucia', () => ({
  validateRequest: vi.fn(),
}))

vi.mock('@/lib/Logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('User Actions', () => {
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(validateRequest as any).mockResolvedValue({ user: mockUser })
  })

  describe('updateAvatar', () => {
    it('should successfully update avatar', async () => {
      const url = 'https://example.com/avatar.jpg'
      ;(updateUserAvatar as any).mockResolvedValue(undefined)

      const result = await updateAvatar(url)

      expect(updateUserAvatar).toHaveBeenCalledWith(mockUser.id, url)
      expect(result).toEqual({ success: true })
    })

    it('should handle errors when updating avatar', async () => {
      const url = 'https://example.com/avatar.jpg'
      ;(updateUserAvatar as any).mockRejectedValue(new Error('DB Error'))

      const result = await updateAvatar(url)

      expect(logger.error).toHaveBeenCalled()
      expect(result).toEqual({ success: false, error: 'Failed to upload image' })
    })

    it('should redirect if user is not authenticated', async () => {
      ;(validateRequest as any).mockResolvedValue({ user: null })
      await updateAvatar('test-url')

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('handleFollowAction', () => {
    it('should successfully follow a user', async () => {
      const targetUserId = 'user-2'
      const action: FollowActionType = 'follow'
      ;(handleFollow as any).mockResolvedValue(undefined)

      const result = await handleFollowAction(targetUserId, action)

      expect(handleFollow).toHaveBeenCalledWith(targetUserId, mockUser.id, action)
      expect(result).toEqual({ success: 'Followed' })
    })

    it('should successfully unfollow a user', async () => {
      const targetUserId = 'user-2'
      const action: FollowActionType = 'unfollow'
      ;(handleFollow as any).mockResolvedValue(undefined)

      const result = await handleFollowAction(targetUserId, action)

      expect(handleFollow).toHaveBeenCalledWith(targetUserId, mockUser.id, action)
      expect(result).toEqual({ success: 'Unfollowed' })
    })

    it('should handle errors in follow action', async () => {
      const targetUserId = 'user-2'
      ;(handleFollow as any).mockRejectedValue(new Error('DB Error'))

      const result = await handleFollowAction(targetUserId, 'follow')

      expect(logger.error).toHaveBeenCalled()
      expect(result).toEqual({ error: DEFAULT_ERROR })
    })
  })
})

describe('User Queries', () => {
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    name: 'Test User',
    avatar: null,
    bio: null,
    followerCount: 0,
    isFollowed: false,
    isFollower: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(validateRequest as any).mockResolvedValue({ user: { id: 'current-user' } })
  })

  describe('isUniqueUserField', () => {
    it('should return true for unique field', async () => {
      ;(findUserByField as any).mockResolvedValue(null)

      const result = await isUniqueUserField('username', 'newuser')

      expect(findUserByField).toHaveBeenCalledWith('username', 'newuser')
      expect(result).toBe(true)
    })

    it('should return false for existing field', async () => {
      ;(findUserByField as any).mockResolvedValue({ id: 'some-id' })

      const result = await isUniqueUserField('email', 'existing@example.com')

      expect(findUserByField).toHaveBeenCalledWith('email', 'existing@example.com')
      expect(result).toBe(false)
    })
  })

  describe('getUserInfo', () => {
    it('should return user info for authenticated request', async () => {
      ;(getAuthUserDetails as any).mockResolvedValue(mockUser)

      const result = await getUserInfo('testuser')

      expect(getAuthUserDetails).toHaveBeenCalledWith('testuser', 'current-user')
      expect(result).toEqual({ user: mockUser })
    })

    it('should handle non-existent user', async () => {
      ;(getAuthUserDetails as any).mockResolvedValue(null)

      const result = await getUserInfo('nonexistent')

      expect(result).toEqual({ error: 'User not found' })
    })

    it('should redirect if user is not authenticated', async () => {
      ;(validateRequest as any).mockResolvedValue({ user: null })

      await getUserInfo('testuser')

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('getPublicUserInfo', () => {
    it('should return public user info', async () => {
      const publicUser = { ...mockUser }
      ;(getPublicUserDetails as any).mockResolvedValue(publicUser)

      const result = await getPublicUserInfo('testuser')

      expect(getPublicUserDetails).toHaveBeenCalledWith('testuser')
      expect(result).toEqual({ user: publicUser })
    })

    it('should handle non-existent user', async () => {
      ;(getPublicUserDetails as any).mockResolvedValue(null)

      const result = await getPublicUserInfo('nonexistent')

      expect(result).toEqual({ error: 'User not found' })
    })

    it('should handle errors', async () => {
      ;(getPublicUserDetails as any).mockRejectedValue(new Error('DB Error'))

      const result = await getPublicUserInfo('testuser')

      expect(result).toEqual({ error: 'Failed to fetch user info' })
    })
  })
})
