import { parseWithZod } from '@conform-to/zod'
import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  deleteLike,
  getAuthPostWithReplies,
  getPostById,
  getPublicPostWithReplies,
  incrementShareCount,
  insertLike,
  insertPost,
  listFollowingPosts,
  listPosts,
} from '@/lib/db/queries'
import type { Post } from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'

import { createPost, handleLikeAction, handleShareAction } from './posts.actions'
import { getAuthPostById, getFollowingPosts, getPosts, getPublicPostById, getSinglePostById } from './posts.queries'

// Mock external dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@conform-to/zod', () => ({
  parseWithZod: vi.fn().mockReturnValue({
    status: 'success',
    value: {
      text: 'Test post content',
      image: 'image-url',
      imageWidth: 800,
      imageHeight: 600,
    },
  }),
}))

vi.mock('@/lib/db/queries', () => ({
  insertPost: vi.fn().mockResolvedValue({ id: 'new-post-123' }),
  insertLike: vi.fn(),
  deleteLike: vi.fn(),
  insertRepost: vi.fn(),
  deleteRepost: vi.fn(),
  incrementShareCount: vi.fn(),
  listPosts: vi.fn(),
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
    replyCount: 0,
    repostCount: 0,
    shareCount: 0,
    userId: mockUser.id,
    image: null,
    imageWidth: null,
    imageHeight: null,
  }

  type PostsResponse = {
    post: Post & { isLiked: boolean; isReposted?: boolean }
    user: typeof mockUser & { isFollowed: boolean }
  }[]

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
      vi.clearAllMocks()
      ;(validateRequest as any).mockResolvedValue({ user: mockUser })
    })

    describe('handleLikeAction', () => {
      it('should successfully like a post', async () => {
        const result = await handleLikeAction('like', mockBasePost.id)

        expect(insertLike).toHaveBeenCalledWith(mockBasePost.id, mockUser.id)
        expect(result).toEqual({ success: true })
      })

      it('should successfully unlike a post', async () => {
        const result = await handleLikeAction('unlike', mockBasePost.id)

        expect(deleteLike).toHaveBeenCalledWith(mockBasePost.id, mockUser.id)
        expect(result).toEqual({ success: true })
      })

      it('should handle errors', async () => {
        ;(insertLike as any).mockRejectedValue(new Error('DB Error'))

        const result = await handleLikeAction('like', mockBasePost.id)

        expect(result).toEqual({ error: 'Something went wrong. Please try again.', success: false })
        expect(logger.error).toHaveBeenCalled()
      })
    })

    describe('createPost', () => {
      it('should create a post with the correct data', async () => {
        const formData = new FormData()
        formData.append('text', 'Test post content')
        formData.append('image', 'image-url')

        const result = await createPost(null, formData)

        expect(insertPost).toHaveBeenCalledWith(mockUser.id, {
          text: 'Test post content',
          image: 'image-url',
          imageWidth: 800,
          imageHeight: 600,
        })
        expect(result).toEqual({ success: true })
      })

      it('should handle validation errors', async () => {
        vi.mocked(parseWithZod).mockReturnValueOnce({
          status: 'error',
          error: new Error('Validation failed'),
        } as any)

        const formData = new FormData()
        const result = await createPost(null, formData)

        expect(insertPost).not.toHaveBeenCalled()
        expect(result).toEqual({ error: 'Something went wrong. Please try again.' })
        expect(logger.info).toHaveBeenCalled()
      })

      it('should handle database errors', async () => {
        const formData = new FormData()
        formData.append('text', 'Test post')
        vi.mocked(insertPost).mockRejectedValueOnce(new Error('DB Error'))

        const result = await createPost(null, formData)

        expect(result).toEqual({ error: 'Something went wrong. Please try again.' })
        expect(logger.error).toHaveBeenCalled()
      })
    })

    describe('handleShareAction', () => {
      it('should successfully increment share count', async () => {
        const result = await handleShareAction(mockBasePost.id)

        expect(incrementShareCount).toHaveBeenCalledWith(mockBasePost.id)
        expect(result).toEqual({ success: true })
      })

      it('should handle errors', async () => {
        ;(incrementShareCount as any).mockRejectedValue(new Error('DB Error'))

        const result = await handleShareAction(mockBasePost.id)

        expect(result).toEqual({ error: 'Something went wrong. Please try again.', success: false })
        expect(logger.error).toHaveBeenCalled()
      })
    })
  })

  describe('Queries', () => {
    describe('getPosts', () => {
      it('should return posts for unauthenticated users', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: null })
        const mockPublicPosts = [
          {
            post: { ...mockBasePost, isLiked: false, isReposted: false },
            user: { ...mockUser, isFollowed: false },
          },
        ]
        ;(listPosts as any).mockResolvedValue(mockPublicPosts)

        const result = await getPosts()

        expect(listPosts).toHaveBeenCalledWith(undefined, undefined)
        expect(result[0]?.user?.isFollowed).toBe(false)
        expect(result[0]?.post?.isLiked).toBe(false)
      })

      it('should return authenticated posts for logged-in users', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: { id: 'current-user' } })
        const mockAuthPosts = [
          {
            post: { ...mockBasePost, isLiked: true, isReposted: false },
            user: { ...mockUser, isFollowed: true },
          },
        ]
        ;(listPosts as any).mockResolvedValue(mockAuthPosts)

        const result = await getPosts()
        const firstPost = result[0]

        expect(listPosts).toHaveBeenCalledWith(undefined, 'current-user')

        if (firstPost && isAuthPost(firstPost)) {
          expect(firstPost.post.isLiked).toBe(true)
          expect(firstPost.user.isFollowed).toBe(true)
        }
      })

      it('should return posts for a specific username', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: { id: 'current-user' } })
        const mockAuthPosts = [
          {
            post: { ...mockBasePost, isLiked: true, isReposted: false },
            user: { ...mockUser, isFollowed: true },
          },
        ]
        ;(listPosts as any).mockResolvedValue(mockAuthPosts)

        const result = await getPosts('testuser')
        const firstPost = result[0]

        expect(listPosts).toHaveBeenCalledWith('testuser', 'current-user')

        if (firstPost && isAuthPost(firstPost)) {
          expect(firstPost.post.isLiked).toBe(true)
          expect(firstPost.user.isFollowed).toBe(true)
        }
      })
    })

    describe('getFollowingPosts', () => {
      it('should return posts from followed users', async () => {
        ;(validateRequest as any).mockResolvedValue({ user: { id: 'current-user' } })
        const mockAuthPosts = [
          {
            post: { ...mockBasePost, isLiked: true, isReposted: false },
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
        const mockPublicPosts: PostsResponse = [
          {
            post: { ...mockBasePost, isLiked: false, isReposted: false },
            user: { ...mockUser, isFollowed: false },
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
        const mockPublicPost: PostsResponse[0] = {
          post: { ...mockBasePost, isLiked: false, isReposted: false },
          user: { ...mockUser, isFollowed: false },
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
