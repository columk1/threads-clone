import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deleteLikeAndUpdateCount,
  getAuthPostWithReplies,
  getPostById,
  getPublicPostWithReplies,
  insertLikeAndUpdateCount,
  listAuthPosts,
  listFollowingPosts,
  listPublicPosts,
} from '@/lib/db/queries'
import type { Post } from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'

import { handleLikeAction } from './posts.actions'
import type { AuthPostsResponse, PublicPostsResponse } from './posts.queries'
import { getAuthPostById, getFollowingPosts, getPosts, getPublicPostById, getSinglePostById } from './posts.queries'

// Mock external dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/db/queries', () => ({
  insertPost: vi.fn(),
  insertLikeAndUpdateCount: vi.fn(),
  deleteLikeAndUpdateCount: vi.fn(),
  listPublicPosts: vi.fn(),
  listAuthPosts: vi.fn(),
  listFollowingPosts: vi.fn(),
  getPublicPostWithReplies: vi.fn(),
  getAuthPostWithReplies: vi.fn(),
  getPostById: vi.fn(),
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

describe('Posts Service', () => {
  // Test data
  const mockUser = {
    id: 'user-1',
    username: 'testuser',
    name: 'Test User',
    avatar: null,
    bio: null,
    followerCount: 0,
    isFollowed: false,
  }

  const mockBasePost: Post = {
    id: 'post-1',
    text: 'Test post',
    createdAt: Date.now(),
    parentId: null,
    likeCount: 0,
    userId: mockUser.id,
    image: null,
  }

  // Type guard to check if a post has isLiked property
  const isAuthPost = (post: {
    post: Post | (Post & { isLiked: boolean })
  }): post is { post: Post & { isLiked: boolean } } => {
    return 'isLiked' in post.post
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Actions', () => {
    beforeEach(() => {
      ;(validateRequest as any).mockResolvedValue({ user: mockUser })
    })

    describe('handleLikeAction', () => {
      it('should successfully like a post', async () => {
        const result = await handleLikeAction('like', mockBasePost.id)

        expect(insertLikeAndUpdateCount).toHaveBeenCalledWith(mockBasePost.id, mockUser.id)
        expect(result).toEqual({ success: true })
      })

      it('should successfully unlike a post', async () => {
        const result = await handleLikeAction('unlike', mockBasePost.id)

        expect(deleteLikeAndUpdateCount).toHaveBeenCalledWith(mockBasePost.id, mockUser.id)
        expect(result).toEqual({ success: true })
      })

      it('should handle errors', async () => {
        ;(insertLikeAndUpdateCount as any).mockRejectedValue(new Error('DB Error'))

        const result = await handleLikeAction('like', mockBasePost.id)

        expect(result).toEqual({ error: 'Something went wrong. Please try again.', success: false })
        expect(logger.error).toHaveBeenCalled()
      })
    })
  })

  describe('Queries', () => {
    describe('getPosts', () => {
      it('should return public posts for unauthenticated users', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: null })
        const mockPublicPosts: PublicPostsResponse = [
          {
            post: mockBasePost,
            user: mockUser,
          },
        ]
        ;(listPublicPosts as any).mockResolvedValue(mockPublicPosts)

        const result = await getPosts()

        expect(listPublicPosts).toHaveBeenCalled()
        expect(listAuthPosts).not.toHaveBeenCalled()
        expect(result[0]?.user?.isFollowed).toBe(false)
      })

      it('should return authenticated posts for logged-in users', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: { id: 'current-user' } })
        const mockAuthPosts: AuthPostsResponse = [
          {
            post: { ...mockBasePost, isLiked: true },
            user: { ...mockUser, isFollowed: true },
          },
        ]
        ;(listAuthPosts as any).mockResolvedValue(mockAuthPosts)

        const result = await getPosts()
        const firstPost = result[0]

        expect(listPublicPosts).not.toHaveBeenCalled()
        expect(listAuthPosts).toHaveBeenCalledWith('current-user', undefined)

        if (firstPost && isAuthPost(firstPost)) {
          expect(firstPost.post.isLiked).toBe(true)
          expect(firstPost.user.isFollowed).toBe(true)
        }
      })
    })

    describe('getFollowingPosts', () => {
      it('should return posts from followed users', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: { id: 'current-user' } })
        const mockAuthPosts: AuthPostsResponse = [
          {
            post: { ...mockBasePost, isLiked: true },
            user: { ...mockUser, isFollowed: true },
          },
        ]
        ;(listFollowingPosts as any).mockResolvedValue(mockAuthPosts)

        const result = await getFollowingPosts()
        const firstPost = result[0]

        expect(listFollowingPosts).toHaveBeenCalledWith('current-user')

        if (firstPost && isAuthPost(firstPost)) {
          expect(firstPost.post.isLiked).toBe(true)
          expect(firstPost.user.isFollowed).toBe(true)
        }
      })

      it('should redirect if user is not authenticated', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: null })

        await getFollowingPosts()

        expect(redirect).toHaveBeenCalledWith('/login')
      })
    })

    describe('getPublicPostById', () => {
      it('should return formatted public post with replies', async () => {
        const mockPublicPosts: PublicPostsResponse = [
          {
            post: mockBasePost,
            user: mockUser,
          },
        ]
        ;(getPublicPostWithReplies as any).mockResolvedValue(mockPublicPosts)

        const result = await getPublicPostById(mockBasePost.id)
        const firstPost = result?.[0]

        expect(getPublicPostWithReplies).toHaveBeenCalledWith(mockBasePost.id)

        if (firstPost && isAuthPost(firstPost)) {
          expect(firstPost.post.isLiked).toBe(false)
          expect(firstPost.user.isFollowed).toBe(false)
        }
      })

      it('should return null for non-existent post', async () => {
        ;(getPublicPostWithReplies as any).mockResolvedValue([])

        const result = await getPublicPostById('non-existent')

        expect(result).toBeNull()
      })
    })

    describe('getAuthPostById', () => {
      type AuthPostWithRepliesResponse = {
        post: Post & { isLiked: boolean }
        user: typeof mockUser & { isFollowed: boolean }
        isLiked: boolean
      }

      it('should return formatted authenticated post with replies', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: { id: 'current-user' } })
        const mockAuthPosts: AuthPostWithRepliesResponse[] = [
          {
            post: { ...mockBasePost, isLiked: true },
            user: { ...mockUser, isFollowed: true },
            isLiked: true,
          },
        ]
        ;(getAuthPostWithReplies as any).mockResolvedValue(mockAuthPosts)

        const result = await getAuthPostById(mockBasePost.id)
        const firstPost = result?.[0]

        expect(getAuthPostWithReplies).toHaveBeenCalledWith(mockBasePost.id, 'current-user')

        if (firstPost && isAuthPost(firstPost)) {
          expect(firstPost.post.isLiked).toBe(true)
          expect(firstPost.user.isFollowed).toBe(true)
        }
      })

      it('should redirect if user is not authenticated', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: null })

        await getAuthPostById(mockBasePost.id)

        expect(redirect).toHaveBeenCalledWith('/login')
      })
    })

    describe('getSinglePostById', () => {
      it('should return a single post with user info', async () => {
        const mockPublicPost: PublicPostsResponse[0] = {
          post: mockBasePost,
          user: mockUser,
        }
        ;(getPostById as any).mockResolvedValue(mockPublicPost)

        const result = await getSinglePostById(mockBasePost.id)

        expect(getPostById).toHaveBeenCalledWith(mockBasePost.id)
        expect(result?.user.isFollowed).toBe(false)
      })

      it('should return null for non-existent post', async () => {
        ;(getPostById as any).mockResolvedValue(null)

        const result = await getSinglePostById('non-existent')

        expect(result).toBeNull()
      })
    })
  })
})
