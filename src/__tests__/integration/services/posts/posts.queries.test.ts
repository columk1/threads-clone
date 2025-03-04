import { describe, expect, it, vi } from 'vitest'

import { repostSchema, type Session } from '@/lib/db/Schema'
import { type SessionValidationResult, validateRequest } from '@/lib/Session'
import {
  getAuthPostById,
  getFollowingPosts,
  getPosts,
  getPublicPostById,
  getReplies,
  getReposts,
  getSinglePostById,
  QUERY_LIMIT,
  searchPosts,
} from '@/services/posts/posts.queries'

import { createTestPost, createTestUser, followUser } from '../../../utils/factories'
import { setupIntegrationTest } from '../../../utils/setupIntegrationTest'
import { testDb } from '../../../utils/testDb'

setupIntegrationTest()

// Mock validateRequest
vi.mock('@/lib/Session', () => ({
  validateRequest: vi.fn().mockResolvedValue({
    user: null,
    session: null,
  } as SessionValidationResult),
}))

describe('Posts Service Tests', () => {
  const createMockSession = (userId: string): Session => ({
    id: 'session-1',
    userId,
    expiresAt: new Date(),
  })

  describe('getPosts', () => {
    it('should format posts data and handle pagination', async () => {
      // Arrange
      const author = await createTestUser()
      const viewer = await createTestUser()
      await followUser(author.id, viewer.id)

      // Create QUERY_LIMIT + 1 posts
      for (let i = 0; i < QUERY_LIMIT + 1; i++) {
        await createTestPost({
          userId: author.id,
          text: `Post ${i}`,
        })
      }

      const mockSession = createMockSession(viewer.id)
      vi.mocked(validateRequest).mockResolvedValue({
        user: viewer,
        session: mockSession,
      })

      // Act
      const result = await getPosts()

      // Assert
      expect(result.posts).toHaveLength(QUERY_LIMIT)
      expect(result.nextOffset).toBe(QUERY_LIMIT)

      const firstPost = result.posts[0]

      expect(firstPost).toBeDefined()

      if (firstPost) {
        expect(firstPost.user.isFollowed).toBe(true)
        expect(typeof firstPost.post.isLiked).toBe('boolean')
      }
    })

    it('should handle empty results', async () => {
      const testUser = await createTestUser()
      const mockSession = createMockSession(testUser.id)
      vi.mocked(validateRequest).mockResolvedValue({
        user: testUser,
        session: mockSession,
      })

      // Create no posts
      const result = await getPosts()

      expect(result.posts).toHaveLength(0)
      expect(result.nextOffset).toBeNull()
    })

    it('should handle pagination correctly', async () => {
      const author = await createTestUser()
      const viewer = await createTestUser()

      // Create exactly QUERY_LIMIT posts
      for (let i = 0; i < QUERY_LIMIT; i++) {
        await createTestPost({
          userId: author.id,
          text: `Post ${i}`,
        })
      }

      const mockSession = createMockSession(viewer.id)
      vi.mocked(validateRequest).mockResolvedValue({
        user: viewer,
        session: mockSession,
      })

      const result = await getPosts(undefined, QUERY_LIMIT) // Second page

      expect(result.posts).toHaveLength(0)
      expect(result.nextOffset).toBeNull()
    })

    it('should handle posts by specific username', async () => {
      const author = await createTestUser()
      const otherUser = await createTestUser()
      const viewer = await createTestUser()

      // Create posts for both users
      await createTestPost({
        userId: author.id,
        text: 'Author post',
      })
      await createTestPost({
        userId: otherUser.id,
        text: 'Other user post',
      })

      const mockSession = createMockSession(viewer.id)
      vi.mocked(validateRequest).mockResolvedValue({
        user: viewer,
        session: mockSession,
      })

      const result = await getPosts(author.username)

      expect(result.posts).toHaveLength(1)

      const firstPost = result.posts[0]

      expect(firstPost?.post.text).toBe('Author post')
    })
  })

  describe('getFollowingPosts', () => {
    it('should return posts from followed users with pagination', async () => {
      // Arrange
      const author = await createTestUser()
      const viewer = await createTestUser()
      await followUser(author.id, viewer.id)

      // Create QUERY_LIMIT + 1 posts
      for (let i = 0; i < QUERY_LIMIT + 1; i++) {
        await createTestPost({
          userId: author.id,
          text: `Post ${i}`,
        })
      }

      const mockSession = createMockSession(viewer.id)
      vi.mocked(validateRequest).mockResolvedValue({
        user: viewer,
        session: mockSession,
      })

      // Act
      const result = await getFollowingPosts()

      // Assert
      expect(result.posts).toHaveLength(QUERY_LIMIT)
      expect(result.nextOffset).toBe(QUERY_LIMIT)

      const firstPost = result.posts[0]

      expect(firstPost).toBeDefined()

      expect(firstPost?.user.isFollowed).toBe(true)
    })

    it('should redirect if user is not authenticated', async () => {
      // Arrange
      vi.mocked(validateRequest).mockResolvedValue({
        user: null,
        session: null,
      })

      // Act & Assert
      await expect(getFollowingPosts()).rejects.toThrow('NEXT_REDIRECT')
    })
  })

  describe('getReplies', () => {
    it('should format replies data', async () => {
      // Arrange
      const author = await createTestUser()
      const parentPost = await createTestPost({
        userId: author.id,
        text: 'Parent post',
      })
      await createTestPost({
        userId: author.id,
        text: 'Reply',
        parentId: parentPost.id,
      })

      vi.mocked(validateRequest).mockResolvedValue({
        user: author,
        session: createMockSession(author.id),
      })

      // Act
      const replies = await getReplies(author.username)

      // Assert
      expect(replies).toHaveLength(1)

      const firstReply = replies[0]

      expect(firstReply).toBeDefined()

      expect(firstReply?.post.parentId).toBe(parentPost.id)
      expect(typeof firstReply?.post.isLiked).toBe('boolean')
      expect(typeof firstReply?.user.isFollowed).toBe('boolean')
    })

    it('should handle user with no replies', async () => {
      const author = await createTestUser()

      vi.mocked(validateRequest).mockResolvedValue({
        user: author,
        session: createMockSession(author.id),
      })

      const replies = await getReplies(author.username)

      expect(replies).toHaveLength(0)
    })

    it('should handle nested replies', async () => {
      const author = await createTestUser()
      const parentPost = await createTestPost({
        userId: author.id,
        text: 'Parent post',
      })
      const reply = await createTestPost({
        userId: author.id,
        text: 'First reply',
        parentId: parentPost.id,
      })
      await createTestPost({
        userId: author.id,
        text: 'Nested reply',
        parentId: reply.id,
      })

      vi.mocked(validateRequest).mockResolvedValue({
        user: author,
        session: createMockSession(author.id),
      })

      const replies = await getReplies(author.username)

      expect(replies).toHaveLength(2)
      expect(replies.some((r) => r.post.text === 'First reply')).toBe(true)
      expect(replies.some((r) => r.post.text === 'Nested reply')).toBe(true)
    })
  })

  describe('getReposts', () => {
    it('should format reposts data', async () => {
      // Arrange
      const author = await createTestUser()
      const post = await createTestPost({
        userId: author.id,
        text: 'Original post',
      })
      await testDb
        .insert(repostSchema)
        .values({
          postId: post.id,
          userId: author.id,
          createdAt: Math.floor(Date.now() / 1000),
        })
        .returning()

      vi.mocked(validateRequest).mockResolvedValue({
        user: author,
        session: createMockSession(author.id),
      })

      // Act
      const reposts = await getReposts(author.username)

      // Assert
      expect(reposts).toHaveLength(1)

      const firstRepost = reposts[0]

      expect(firstRepost).toBeDefined()

      expect(typeof firstRepost?.post.isLiked).toBe('boolean')
      expect(typeof firstRepost?.post.isReposted).toBe('boolean')
      expect(typeof firstRepost?.user.isFollowed).toBe('boolean')
    })
  })

  describe('getPublicPostById', () => {
    it('should format post data for unauthenticated users', async () => {
      // Arrange
      const author = await createTestUser()
      const post = await createTestPost({
        userId: author.id,
        text: 'Test post',
      })

      // Act
      const result = await getPublicPostById(post.id)

      // Assert
      expect(result).toBeDefined()

      expect(result?.[0]?.post.isLiked).toBe(false)
      expect(result?.[0]?.user.isFollowed).toBe(false)
    })
  })

  describe('getAuthPostById', () => {
    it('should format post data for authenticated users', async () => {
      // Arrange
      const author = await createTestUser()
      const viewer = await createTestUser()
      const post = await createTestPost({
        userId: author.id,
        text: 'Test post',
      })

      vi.mocked(validateRequest).mockResolvedValue({
        user: viewer,
        session: createMockSession(viewer.id),
      })

      // Act
      const result = await getAuthPostById(post.id)

      // Assert
      expect(result).toBeDefined()

      expect(typeof result?.[0]?.post.isLiked).toBe('boolean')
      expect(typeof result?.[0]?.user.isFollowed).toBe('boolean')
    })

    it('should redirect if user is not authenticated', async () => {
      // Arrange
      vi.mocked(validateRequest).mockResolvedValue({
        user: null,
        session: null,
      })

      // Act & Assert
      await expect(getAuthPostById('123')).rejects.toThrow()
    })
  })

  describe('getSinglePostById', () => {
    it('should format single post data', async () => {
      // Arrange
      const author = await createTestUser()
      const post = await createTestPost({
        userId: author.id,
        text: 'Test post',
      })

      // Act
      const result = await getSinglePostById(post.id)

      // Assert
      expect(result).toBeDefined()

      expect(result?.user.isFollowed).toBe(false)
    })
  })

  describe('searchPosts', () => {
    it('should format search results and handle pagination', async () => {
      // Arrange
      const author = await createTestUser()

      // Create QUERY_LIMIT + 1 posts with searchable text
      for (let i = 0; i < QUERY_LIMIT + 1; i++) {
        await createTestPost({
          userId: author.id,
          text: `Searchable post ${i}`,
        })
      }

      vi.mocked(validateRequest).mockResolvedValue({
        user: author,
        session: createMockSession(author.id),
      })

      // Act
      const result = await searchPosts('Searchable')

      // Assert
      expect(result.posts).toHaveLength(QUERY_LIMIT)
      expect(result.nextOffset).toBe(QUERY_LIMIT)

      const firstPost = result.posts[0]

      expect(firstPost).toBeDefined()

      expect(typeof firstPost?.post.isLiked).toBe('boolean')
      expect(typeof firstPost?.user.isFollowed).toBe('boolean')
    })

    it('should return matching posts for authenticated user', async () => {
      const author = await createTestUser()
      await createTestPost({
        userId: author.id,
        text: 'Searchable content',
      })
      await createTestPost({
        userId: author.id,
        text: 'Different content',
      })

      vi.mocked(validateRequest).mockResolvedValue({
        user: author,
        session: createMockSession(author.id),
      })

      const result = await searchPosts('Searchable')

      expect(result.posts).toHaveLength(1)

      const firstPost = result.posts[0]

      expect(firstPost?.post.text).toBe('Searchable content')
    })

    it('should handle no search results', async () => {
      const author = await createTestUser()
      await createTestPost({
        userId: author.id,
        text: 'Some content',
      })

      vi.mocked(validateRequest).mockResolvedValue({
        user: author,
        session: createMockSession(author.id),
      })

      const result = await searchPosts('NonexistentTerm')

      expect(result.posts).toHaveLength(0)
      expect(result.nextOffset).toBeNull()
    })

    it('should handle search for unauthenticated user', async () => {
      const author = await createTestUser()
      await createTestPost({
        userId: author.id,
        text: 'Searchable content',
      })

      vi.mocked(validateRequest).mockResolvedValue({
        user: null,
        session: null,
      })

      const result = await searchPosts('Searchable')
      const firstPost = result.posts[0]

      expect(firstPost?.post.isLiked).toBe(false)
      expect(firstPost?.user.isFollowed).toBe(false)
    })
  })
})
