import { parseWithZod } from '@conform-to/zod'
import type { Session } from 'lucia'
import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestPost, createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import { testDb } from '@/__tests__/utils/testDb'
import { likeSchema, repostSchema } from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'
import {
  createPost,
  createReply,
  handleLikeAction,
  handleRepostAction,
  handleShareAction,
} from '@/services/posts/posts.actions'

setupIntegrationTest()

// Mock external dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@conform-to/zod', () => ({
  parseWithZod: vi.fn((formData: FormData) => ({
    status: 'success',
    value: {
      text: formData.get('text'),
      parentId: formData.get('parentId'),
      image: formData.get('image'),
      imageWidth: formData.get('imageWidth'),
      imageHeight: formData.get('imageHeight'),
    },
  })),
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

describe('Posts Actions', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>
  let testPost: Awaited<ReturnType<typeof createTestPost>>

  const createMockSession = (userId: string): Session => ({
    id: 'session-1',
    userId,
    expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
    fresh: false,
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    testUser = await createTestUser()
    testPost = await createTestPost({
      userId: testUser.id,
      text: 'Test post',
    })
    const mockSession = createMockSession(testUser.id)
    vi.mocked(validateRequest).mockResolvedValue({ user: testUser, session: mockSession })
  })

  describe('createPost', () => {
    it('should create a post with text only', async () => {
      const formData = new FormData()
      formData.append('text', 'Test post content')

      const result = await createPost(null, formData)

      expect(result).toEqual({ success: true })

      // Verify post was created in DB
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser.id),
      })

      expect(posts).toHaveLength(2) // Including the testPost from beforeEach

      const newPost = posts[1]

      expect(newPost).toBeDefined()
      // After this point we know newPost exists
      expect(newPost!.text).toBe('Test post content')
    })

    it('should create a post with text and image', async () => {
      const formData = new FormData()
      formData.append('text', 'Test post content')
      formData.append('image', 'image-url')

      const result = await createPost(null, formData)

      expect(result).toEqual({ success: true })

      // Verify post was created in DB
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser.id),
      })

      expect(posts).toHaveLength(2)

      const newPost = posts[1]

      expect(newPost).toBeDefined()
      // After this point we know newPost exists
      expect(newPost!.text).toBe('Test post content')
      expect(newPost!.image).toBe('image-url')
    })

    it('should handle validation errors', async () => {
      vi.mocked(parseWithZod).mockReturnValueOnce({
        status: 'error',
        error: new Error('Validation failed'),
      } as any)

      const formData = new FormData()
      const result = await createPost(null, formData)

      expect(result).toEqual({ error: 'Something went wrong. Please try again.' })
      expect(logger.error).toHaveBeenCalled()

      // Verify no post was created
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser.id),
      })

      expect(posts).toHaveLength(1) // Only the testPost from beforeEach
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      const formData = new FormData()
      await createPost(null, formData)

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('createReply', () => {
    it('should create a reply to a post', async () => {
      const formData = new FormData()
      formData.append('text', 'Test reply')
      formData.append('parentId', testPost.id)

      const result = await createReply(null, formData)

      expect(result).toHaveProperty('data.id')

      // Verify reply was created in DB
      const replies = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.parentId, testPost.id),
      })

      expect(replies).toHaveLength(1)

      const reply = replies[0]

      expect(reply).toBeDefined()
      expect(reply!.text).toBe('Test reply')
    })

    it('should handle validation errors', async () => {
      vi.mocked(parseWithZod).mockReturnValueOnce({
        status: 'error',
        error: new Error('Validation failed'),
      } as any)

      const formData = new FormData()
      const result = await createReply(null, formData)

      expect(result).toEqual({ error: 'Something went wrong. Please try again.' })
      expect(logger.error).toHaveBeenCalled()

      // Verify no reply was created
      const replies = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.parentId, testPost.id),
      })

      expect(replies).toHaveLength(0)
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      const formData = new FormData()
      await createReply(null, formData)

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('handleLikeAction', () => {
    it('should successfully like a post', async () => {
      const result = await handleLikeAction('like', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify like was created in DB
      const likes = await testDb.query.likeSchema.findMany({
        where: (likes, { and, eq }) => and(eq(likes.userId, testUser.id), eq(likes.postId, testPost.id)),
      })

      expect(likes).toHaveLength(1)
    })

    it('should successfully unlike a post', async () => {
      // First create a like
      await testDb.insert(likeSchema).values({
        userId: testUser.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleLikeAction('unlike', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify like was removed from DB
      const likes = await testDb.query.likeSchema.findMany({
        where: (likes, { and, eq }) => and(eq(likes.userId, testUser.id), eq(likes.postId, testPost.id)),
      })

      expect(likes).toHaveLength(0)
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      await handleLikeAction('like', testPost.id)

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('handleRepostAction', () => {
    it('should successfully repost a post', async () => {
      const result = await handleRepostAction('repost', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify repost was created in DB
      const reposts = await testDb.query.repostSchema.findMany({
        where: (reposts, { and, eq }) => and(eq(reposts.userId, testUser.id), eq(reposts.postId, testPost.id)),
      })

      expect(reposts).toHaveLength(1)
    })

    it('should successfully unrepost a post', async () => {
      // First create a repost
      await testDb.insert(repostSchema).values({
        userId: testUser.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleRepostAction('unrepost', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify repost was removed from DB
      const reposts = await testDb.query.repostSchema.findMany({
        where: (reposts, { and, eq }) => and(eq(reposts.userId, testUser.id), eq(reposts.postId, testPost.id)),
      })

      expect(reposts).toHaveLength(0)
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      await handleRepostAction('repost', testPost.id)

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('handleShareAction', () => {
    it('should successfully increment share count', async () => {
      const initialShareCount = testPost.shareCount

      const result = await handleShareAction(testPost.id)

      expect(result).toEqual({ success: true })

      // Verify share count was incremented in DB
      const updatedPost = await testDb.query.postSchema.findFirst({
        where: (posts, { eq }) => eq(posts.id, testPost.id),
      })

      expect(updatedPost).toBeDefined()
      expect(updatedPost!.shareCount).toBe(initialShareCount + 1)
    })
  })
})
