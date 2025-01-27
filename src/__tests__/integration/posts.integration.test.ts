import { eq } from 'drizzle-orm'
import { ulid } from 'ulidx'
import { describe, expect, it } from 'vitest'

import { listFollowingPosts, listPosts } from '@/lib/db/queries'
import * as schema from '@/lib/db/Schema'

import { setupIntegrationTest } from '../utils/setupIntegrationTest'

const { testDb } = setupIntegrationTest()

describe('Posts Service Integration Tests', () => {
  it('should create and retrieve a post', async () => {
    // Create a test user
    const userId = ulid()
    await testDb.insert(schema.userSchema).values({
      id: userId,
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      username: 'testuser',
      emailVerified: 1,
      followerCount: 0,
    })

    // Create a test post
    const postId = ulid()
    await testDb.insert(schema.postSchema).values({
      id: postId,
      text: 'Test post content',
      userId,
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      shareCount: 0,
    })

    // Retrieve the post
    const post = await testDb.query.postSchema.findFirst({
      where: eq(schema.postSchema.id, postId),
      with: {
        user: true,
      },
    })

    // Assertions
    expect(post).toBeDefined()
    expect(post?.text).toBe('Test post content')
    expect(post?.userId).toBe(userId)
    expect(post?.user?.username).toBe('testuser')
  })

  it('should handle post interactions (likes, reposts)', async () => {
    // Create test users
    const [userId1, userId2] = [ulid(), ulid()]
    await testDb.insert(schema.userSchema).values([
      {
        id: userId1,
        email: 'user1@example.com',
        password: 'password123',
        name: 'User 1',
        username: 'user1',
        emailVerified: 1,
        followerCount: 0,
      },
      {
        id: userId2,
        email: 'user2@example.com',
        password: 'password123',
        name: 'User 2',
        username: 'user2',
        emailVerified: 1,
        followerCount: 0,
      },
    ])

    // Create a test post
    const postId = ulid()
    await testDb.insert(schema.postSchema).values({
      id: postId,
      text: 'Test post for interactions',
      userId: userId1,
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      shareCount: 0,
    })

    // Add a like
    await testDb.insert(schema.likeSchema).values({
      userId: userId2,
      postId,
    })

    // Add a repost
    await testDb.insert(schema.repostSchema).values({
      userId: userId2,
      postId,
    })

    // Update post counts
    await testDb
      .update(schema.postSchema)
      .set({
        likeCount: 1,
        repostCount: 1,
      })
      .where(eq(schema.postSchema.id, postId))

    // Retrieve the post with updated counts
    const post = await testDb.query.postSchema.findFirst({
      where: eq(schema.postSchema.id, postId),
    })

    // Assertions
    expect(post).toBeDefined()
    expect(post?.likeCount).toBe(1)
    expect(post?.repostCount).toBe(1)

    // Verify like exists
    const like = await testDb.query.likeSchema.findFirst({
      where: eq(schema.likeSchema.postId, postId),
    })

    expect(like).toBeDefined()

    // Verify repost exists
    const repost = await testDb.query.repostSchema.findFirst({
      where: eq(schema.repostSchema.postId, postId),
    })

    expect(repost).toBeDefined()
  })

  it('should handle replies to posts', async () => {
    // Create a test user
    const userId = ulid()
    await testDb.insert(schema.userSchema).values({
      id: userId,
      email: 'test3@example.com',
      password: 'password123',
      name: 'Test User 3',
      username: 'testuser3',
      emailVerified: 1,
      followerCount: 0,
    })

    // Create a parent post
    const parentId = ulid()
    await testDb.insert(schema.postSchema).values({
      id: parentId,
      text: 'Parent post',
      userId,
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      shareCount: 0,
    })

    // Create a reply
    const replyId = ulid()
    await testDb.insert(schema.postSchema).values({
      id: replyId,
      text: 'Reply to parent',
      userId,
      parentId,
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      shareCount: 0,
    })

    // Update parent's reply count
    await testDb
      .update(schema.postSchema)
      .set({
        replyCount: 1,
      })
      .where(eq(schema.postSchema.id, parentId))

    // Retrieve the reply with its parent
    const reply = await testDb.query.postSchema.findFirst({
      where: eq(schema.postSchema.id, replyId),
      with: {
        parent: true,
      },
    })

    // Assertions
    expect(reply).toBeDefined()
    expect(reply?.parentId).toBe(parentId)
    expect(reply?.text).toBe('Reply to parent')
    expect(reply?.parent?.replyCount).toBe(1)
  })

  it('should handle following and post visibility', async () => {
    // Create test users
    const [userId1, userId2] = [ulid(), ulid()]
    await testDb.insert(schema.userSchema).values([
      {
        id: userId1,
        email: 'user4@example.com',
        password: 'password123',
        name: 'User 4',
        username: 'user4',
        emailVerified: 1,
        followerCount: 0,
      },
      {
        id: userId2,
        email: 'user5@example.com',
        password: 'password123',
        name: 'User 5',
        username: 'user5',
        emailVerified: 1,
        followerCount: 0,
      },
    ])

    // User2 follows User1
    await testDb.insert(schema.followerSchema).values({
      userId: userId1,
      followerId: userId2,
    })

    // Update follower count
    await testDb
      .update(schema.userSchema)
      .set({
        followerCount: 1,
      })
      .where(eq(schema.userSchema.id, userId1))

    // Create posts for both users
    const [post1Id, post2Id] = [ulid(), ulid()]
    await testDb.insert(schema.postSchema).values([
      {
        id: post1Id,
        text: 'Post from followed user',
        userId: userId1,
        likeCount: 0,
        replyCount: 0,
        repostCount: 0,
        shareCount: 0,
      },
      {
        id: post2Id,
        text: 'Post from unfollowed user',
        userId: userId2,
        likeCount: 0,
        replyCount: 0,
        repostCount: 0,
        shareCount: 0,
      },
    ])

    // Verify the user's follower count
    const user = await testDb.query.userSchema.findFirst({
      where: eq(schema.userSchema.id, userId1),
    })

    expect(user?.followerCount).toBe(1)

    // Test following posts visibility
    const followingPosts = await listFollowingPosts(userId2)

    expect(followingPosts.length).toBe(1)

    const followedPost = followingPosts[0]

    expect(followedPost?.post.id).toBe(post1Id)
    expect(followedPost?.user.id).toBe(userId1)
    expect(followedPost?.user.isFollowed).toBe(1)

    // Test all posts visibility
    const allPosts = await listPosts(undefined, userId2)

    expect(allPosts.length).toBe(2)

    const visiblePost = allPosts[1]

    expect(visiblePost).toBeDefined()

    if (visiblePost) {
      expect(visiblePost.post.id).toBe(post2Id)
      expect(visiblePost.user.id).toBe(userId2)
      expect(visiblePost.user.isFollowed).toBe(0)
    }
  })
})
