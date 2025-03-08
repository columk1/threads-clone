import { sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import type OpenAI from 'openai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestPost, createTestUser } from '@/__tests__/utils/factories'
import { setupIntegrationTest } from '@/__tests__/utils/setupIntegrationTest'
import { testDb } from '@/__tests__/utils/testDb'
import { DEFAULT_ERROR } from '@/lib/constants'
import type { Session } from '@/lib/db/Schema'
import { likeSchema, notificationSchema, postSchema, repostSchema } from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'
import { moderateContent } from '@/lib/OpenAi'
import { validateRequest } from '@/lib/Session'
import {
  createPost,
  createReply,
  handleDeleteAction,
  handleLikeAction,
  handleRepostAction,
  handleShareAction,
  moderatePost,
} from '@/services/posts/posts.actions'

setupIntegrationTest()

// Mock external dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/Session', () => ({
  validateRequest: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/Logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock OpenAI moderation
vi.mock('@/lib/OpenAi', () => ({
  moderateContent: vi.fn(),
}))

// Mock next/server after() to execute synchronously
vi.mock('next/server', () => ({
  after: async (fn: () => Promise<void>) => await fn(),
  redirect: vi.fn(), // Keep the existing redirect mock
}))

describe('Posts Actions', () => {
  let testUser1: Awaited<ReturnType<typeof createTestUser>>
  let testPost: Awaited<ReturnType<typeof createTestPost>>
  let testUser2: Awaited<ReturnType<typeof createTestUser>>

  const createMockSession = (userId: string): Session => ({
    id: 'session-1',
    userId,
    expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    testUser1 = await createTestUser()
    testUser2 = await createTestUser()
    testPost = await createTestPost({
      userId: testUser1.id,
      text: 'Test post',
    })
    const mockSession = createMockSession(testUser2.id)
    vi.mocked(validateRequest).mockResolvedValue({ user: testUser2, session: mockSession })
  })

  describe('createPost', () => {
    it('should create a post with text only', async () => {
      const formData = new FormData()
      formData.append('text', 'Test post content')

      const result = await createPost(null, formData)

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          postId: expect.any(String),
        }),
      })

      // Verify post was created in DB
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser2.id),
      })

      expect(posts).toHaveLength(1)

      const newPost = posts[0]

      expect(newPost?.text).toBe('Test post content')
    })

    it('should create a post with text and image', async () => {
      const formData = new FormData()
      formData.append('text', 'Test post content')
      formData.append('image', 'https://example.com/image.jpg')
      formData.append('imageWidth', '800')
      formData.append('imageHeight', '600')

      const result = await createPost(null, formData)

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          postId: expect.any(String),
        }),
      })

      // Verify post was created in DB
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser2.id),
      })

      expect(posts).toHaveLength(1)

      const newPost = posts[0]

      expect(newPost?.text).toBe('Test post content')
      expect(newPost?.image).toBe('https://example.com/image.jpg')
      expect(newPost?.imageWidth).toBe(800)
      expect(newPost?.imageHeight).toBe(600)
    })

    it('should handle text exceeding max length', async () => {
      const formData = new FormData()
      formData.append('text', 'x'.repeat(501))

      const result = await createPost(null, formData)

      expect(result).toEqual(
        expect.objectContaining({
          error: expect.any(Array),
        }),
      )

      // Verify no post was created
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser1.id),
      })

      expect(posts).toHaveLength(1) // Only the testPost from beforeEach
    })

    it('should handle missing text and image', async () => {
      const formData = new FormData()

      const result = await createPost(null, formData)

      expect(result).toEqual(
        expect.objectContaining({
          error: expect.any(Array),
        }),
      )

      // Verify no post was created
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser1.id),
      })

      expect(posts).toHaveLength(1)
    })

    it('should handle invalid image URL', async () => {
      const formData = new FormData()
      formData.append('image', 'not-a-url')
      formData.append('imageWidth', '800')
      formData.append('imageHeight', '600')

      const result = await createPost(null, formData)

      expect(result).toEqual(
        expect.objectContaining({
          error: expect.anything(),
        }),
      )

      // Verify no post was created
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser1.id),
      })

      expect(posts).toHaveLength(1)
    })

    it('should handle missing image dimensions', async () => {
      const formData = new FormData()
      formData.append('image', 'https://example.com/image.jpg')

      const result = await createPost(null, formData)

      expect(result).toEqual(
        expect.objectContaining({
          error: expect.any(Array),
        }),
      )

      // Verify no post was created
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser1.id),
      })

      expect(posts).toHaveLength(1)
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      const formData = new FormData()
      await createPost(null, formData)

      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should normalize line breaks in text content', async () => {
      const formData = new FormData()
      formData.append('text', 'First paragraph\r\n\r\n\r\n\r\nSecond paragraph\r\n\r\n\r\n\r\n\r\nThird paragraph')

      const result = await createPost(null, formData)

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          postId: expect.any(String),
        }),
      })

      // Verify post was created in DB with normalized line breaks
      const posts = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.userId, testUser2.id),
      })

      expect(posts).toHaveLength(1)

      const newPost = posts[0]

      expect(JSON.stringify(newPost?.text)).toBe(
        JSON.stringify('First paragraph\r\n\r\nSecond paragraph\r\n\r\nThird paragraph'),
      )
    })
  })

  describe('createReply', () => {
    it('should create a reply to a post and create a notification', async () => {
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
      expect(reply?.text).toBe('Test reply')

      // Verify notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.userId, testUser1.id),
            eq(notifications.type, 'REPLY'),
            eq(notifications.sourceUserId, testUser2.id),
            eq(notifications.postId, testPost.id),
            eq(notifications.replyId, reply?.id || ''),
          ),
      })

      expect(notifications).toHaveLength(1)
    })

    it('should handle validation errors', async () => {
      const formData = new FormData()
      // Don't add required text or parentId
      const result = await createReply(null, formData)

      expect(result).toEqual(
        expect.objectContaining({
          error: expect.anything(),
        }),
      )

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
    it('should successfully like a post and create a notification', async () => {
      const result = await handleLikeAction('like', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify like was created in DB
      const likes = await testDb.query.likeSchema.findMany({
        where: (likes, { and, eq }) => and(eq(likes.userId, testUser2.id), eq(likes.postId, testPost.id)),
      })

      expect(likes).toHaveLength(1)

      // Verify notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.userId, testUser1.id),
            eq(notifications.type, 'LIKE'),
            eq(notifications.sourceUserId, testUser2.id),
            eq(notifications.postId, testPost.id),
          ),
      })

      expect(notifications).toHaveLength(1)
    })

    it('should not create a notification when liking your own post', async () => {
      // Mock the session to be the post author
      const mockSession = createMockSession(testUser1.id)
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: testUser1, session: mockSession })

      const result = await handleLikeAction('like', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify no notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.userId, testUser1.id),
            eq(notifications.type, 'LIKE'),
            eq(notifications.sourceUserId, testUser1.id),
          ),
      })

      expect(notifications).toHaveLength(0)
    })

    it('should successfully unlike a post', async () => {
      // First create a like with testUser2
      await testDb.insert(likeSchema).values({
        userId: testUser2.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleLikeAction('unlike', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify like was removed from DB
      const likes = await testDb.query.likeSchema.findMany({
        where: (likes, { and, eq }) => and(eq(likes.userId, testUser2.id), eq(likes.postId, testPost.id)),
      })

      expect(likes).toHaveLength(0)
    })

    it('should not create a notification when unliking a post', async () => {
      // First create a like with testUser2
      await testDb.insert(likeSchema).values({
        userId: testUser2.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleLikeAction('unlike', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify no notification was created for the unlike action
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.type, 'LIKE'),
            eq(notifications.userId, testUser1.id),
            eq(notifications.sourceUserId, testUser2.id),
            eq(notifications.postId, testPost.id),
          ),
      })

      expect(notifications).toHaveLength(0)
    })

    it('should not create a duplicate like notification when liking again after unlike', async () => {
      // First create a notification for the initial like
      await testDb.insert(notificationSchema).values({
        userId: testUser1.id,
        type: 'LIKE',
        sourceUserId: testUser2.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleLikeAction('like', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify no duplicate notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.type, 'LIKE'),
            eq(notifications.userId, testUser1.id),
            eq(notifications.sourceUserId, testUser2.id),
            eq(notifications.postId, testPost.id),
          ),
      })

      expect(notifications).toHaveLength(1)
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      await handleLikeAction('like', testPost.id)

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('handleRepostAction', () => {
    it('should successfully repost a post and create a notification', async () => {
      const result = await handleRepostAction('repost', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify repost was created in DB
      const reposts = await testDb.query.repostSchema.findMany({
        where: (reposts, { and, eq }) => and(eq(reposts.userId, testUser2.id), eq(reposts.postId, testPost.id)),
      })

      expect(reposts).toHaveLength(1)

      // Verify notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.userId, testUser1.id),
            eq(notifications.type, 'REPOST'),
            eq(notifications.sourceUserId, testUser2.id),
            eq(notifications.postId, testPost.id),
          ),
      })

      expect(notifications).toHaveLength(1)
    })

    it('should not create a notification when reposting your own post', async () => {
      // Mock the session to be the post author
      const mockSession = createMockSession(testUser1.id)
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: testUser1, session: mockSession })

      const result = await handleRepostAction('repost', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify no notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.userId, testUser1.id),
            eq(notifications.type, 'REPOST'),
            eq(notifications.sourceUserId, testUser1.id),
          ),
      })

      expect(notifications).toHaveLength(0)
    })

    it('should successfully unrepost a post', async () => {
      // First create a repost with testUser2
      await testDb.insert(repostSchema).values({
        userId: testUser2.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleRepostAction('unrepost', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify repost was removed from DB
      const reposts = await testDb.query.repostSchema.findMany({
        where: (reposts, { and, eq }) => and(eq(reposts.userId, testUser2.id), eq(reposts.postId, testPost.id)),
      })

      expect(reposts).toHaveLength(0)
    })

    it('should not create a duplicate repost notification', async () => {
      await testDb.insert(notificationSchema).values({
        userId: testUser2.id,
        type: 'REPOST',
        sourceUserId: testUser1.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleRepostAction('repost', testPost.id)

      expect(result).toEqual({ success: true })

      // Verify no duplicate notification was created
      const notifications = await testDb.query.notificationSchema.findMany({
        where: (notifications, { and, eq }) =>
          and(
            eq(notifications.type, 'REPOST'),
            eq(notifications.userId, testUser2.id),
            eq(notifications.sourceUserId, testUser1.id),
            eq(notifications.postId, testPost.id),
          ),
      })

      expect(notifications).toHaveLength(1)
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
      expect(updatedPost?.shareCount).toBe(initialShareCount + 1)
    })
  })

  describe('handleDeleteAction', () => {
    it('should successfully delete a post', async () => {
      const result = await handleDeleteAction(testPost.id)

      expect(result).toEqual({
        success: true,
        data: {
          parentId: null,
        },
      })

      // Verify post was deleted from DB
      const post = await testDb.query.postSchema.findFirst({
        where: (posts, { eq }) => eq(posts.id, testPost.id),
      })

      expect(post).toBeUndefined()
    })

    it('should delete associated likes and reposts when deleting a post', async () => {
      // Create a like and repost first
      await testDb.insert(likeSchema).values({
        userId: testUser1.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })
      await testDb.insert(repostSchema).values({
        userId: testUser1.id,
        postId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleDeleteAction(testPost.id)

      expect(result).toEqual({
        success: true,
        data: {
          parentId: null,
        },
      })

      // Verify likes were deleted
      const likes = await testDb.query.likeSchema.findMany({
        where: (likes, { eq }) => eq(likes.postId, testPost.id),
      })

      expect(likes).toHaveLength(0)

      // Verify reposts were deleted
      const reposts = await testDb.query.repostSchema.findMany({
        where: (reposts, { eq }) => eq(reposts.postId, testPost.id),
      })

      expect(reposts).toHaveLength(0)
    })

    it('should delete replies when deleting a post', async () => {
      // Create a reply first
      await testDb.insert(postSchema).values({
        id: 'reply-1',
        userId: testUser1.id,
        text: 'Test reply',
        parentId: testPost.id,
        createdAt: Math.floor(Date.now() / 1000),
      })

      const result = await handleDeleteAction(testPost.id)

      expect(result).toEqual({
        success: true,
        data: {
          parentId: null,
        },
      })

      // Verify replies were deleted
      const replies = await testDb.query.postSchema.findMany({
        where: (posts, { eq }) => eq(posts.parentId, testPost.id),
      })

      expect(replies).toHaveLength(0)
    })

    it('should redirect if user is not authenticated', async () => {
      vi.mocked(validateRequest).mockResolvedValueOnce({ user: null, session: null })

      await handleDeleteAction(testPost.id)

      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should succeed when deleting a non-existant posts', async () => {
      // Delete the test post first so we know it doesn't exist
      const result = await handleDeleteAction('non-existant-post-id')

      expect(result).toEqual({
        success: true,
        data: {
          parentId: undefined,
        },
      })
    })

    it('should handle database errors', async () => {
      // Force a database error by executing invalid SQL
      await testDb.run(sql`ALTER TABLE posts RENAME TO posts_temp`)

      const result = await handleDeleteAction(testPost.id)

      expect(result).toEqual({
        error: DEFAULT_ERROR,
        success: false,
      })

      // Restore the table
      await testDb.run(sql`ALTER TABLE posts_temp RENAME TO posts`)
    })
  })

  describe('moderatePost', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    afterEach(() => {
      vi.clearAllTimers()
    })

    it('should successfully moderate a clean post', async () => {
      // Log initial state
      const initialPost = await testDb.query.postSchema.findFirst({
        where: (posts, { eq }) => eq(posts.id, testPost.id),
      })
      logger.info({ message: 'Initial post:', post: initialPost })

      vi.mocked(moderateContent).mockResolvedValueOnce({
        results: [{ flagged: false }],
      } as OpenAI.ModerationCreateResponse)

      const result = await moderatePost(testPost.id)
      logger.info({ message: 'Result:', result })

      expect(result).toEqual({ success: true })
      expect(moderateContent).toHaveBeenCalledWith(testPost.text, testPost.image)

      // Log state after moderation
      const postAfterModeration = await testDb.query.postSchema.findFirst({
        where: (posts, { eq }) => eq(posts.id, testPost.id),
      })
      logger.info({ message: 'Post after moderation, before wait:', post: postAfterModeration })

      // Wait for the async moderation to complete
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Log final state
      const finalPost = await testDb.query.postSchema.findFirst({
        where: (posts, { eq }) => eq(posts.id, testPost.id),
      })
      logger.info({ message: 'Final post:', post: finalPost })

      // Verify post still exists
      const post = await testDb.query.postSchema.findFirst({
        where: (posts, { eq }) => eq(posts.id, testPost.id),
      })

      expect(post).toBeDefined()

      // Verify report status was updated
      const reportedPost = await testDb.query.reportedPostSchema.findFirst({
        where: (posts, { eq }) => eq(posts.postId, testPost.id),
      })

      expect(reportedPost).toBeDefined()
      expect(reportedPost?.status).toBe('REVIEWED')
    })

    it('should delete post when moderation flags content', async () => {
      vi.mocked(moderateContent).mockResolvedValueOnce({
        results: [{ flagged: true }],
      } as OpenAI.ModerationCreateResponse)

      const result = await moderatePost(testPost.id)

      expect(result).toEqual({ success: true })
      expect(moderateContent).toHaveBeenCalledWith(testPost.text, testPost.image)

      // Wait for the async deletion to complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify post was deleted
      const post = await testDb.query.postSchema.findFirst({
        where: (posts, { eq }) => eq(posts.id, testPost.id),
      })

      expect(post).toBeUndefined()
    })

    it('should handle non-existent posts', async () => {
      const nonExistentId = 'non-existent-id'
      const result = await moderatePost(nonExistentId)

      expect(result).toEqual({
        error: DEFAULT_ERROR,
        success: false,
      })
      expect(moderateContent).not.toHaveBeenCalled()
    })

    it('should handle moderation service failures', async () => {
      vi.mocked(moderateContent).mockRejectedValueOnce(new Error('Moderation service error'))

      const result = await moderatePost(testPost.id)

      // The initial call succeeds because error happens in after()
      expect(result).toEqual({ success: true })

      // Wait for the async moderation to complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify post still exists since moderation failed
      const post = await testDb.query.postSchema.findFirst({
        where: (posts, { eq }) => eq(posts.id, testPost.id),
      })

      expect(post).toBeDefined()
    })
  })
})
