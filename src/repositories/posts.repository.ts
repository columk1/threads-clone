import type { SQLWrapper } from 'drizzle-orm'
import { and, desc, eq, isNotNull, isNull, or, sql } from 'drizzle-orm'

import { db } from '../lib/db/Drizzle'
import {
  followerSchema,
  likeSchema,
  notificationSchema,
  type Post,
  postSchema,
  reportedPostSchema,
  type reportedPostStatusEnum,
  repostSchema,
  type Transaction,
  userSchema,
} from '../lib/db/Schema'
import { authPostSelect, authUserSelect, publicPostSelect, publicUserSelect } from '../lib/db/selectors'

export type PostData = Post & { isLiked: boolean; isReposted: boolean }

export const getPost = async (postId: string) => {
  return await db.select().from(postSchema).where(eq(postSchema.id, postId)).get()
}

export const listPublicPosts = async (authorUsername?: string) => {
  const query = db
    .select({
      post: publicPostSelect,
      user: publicUserSelect,
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(isNull(postSchema.parentId))
    .orderBy(desc(postSchema.createdAt))
    .$dynamic()

  if (authorUsername) {
    query.where(eq(userSchema.username, authorUsername))
  }
  return await query.all()
}

/**
 * Lists posts with pagination and optional filtering
 * @param username - Optional username to filter posts by author
 * @param userId - Optional user ID for authenticated post details
 * @param offset - Number of posts to skip (default: 0)
 * @param limit - Maximum number of posts to return (default: 8)
 * @returns Array of posts with their authors
 */
export const listPosts = async (username?: string, userId?: string, offset: number = 0, limit: number = 8) => {
  const filters: SQLWrapper[] = [isNull(postSchema.parentId)]
  if (username) {
    filters.push(eq(userSchema.username, username))
  }

  const query = db
    .select({
      post: userId ? authPostSelect(userId) : publicPostSelect,
      user: userId ? authUserSelect(userId) : publicUserSelect,
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(and(...filters))
    .orderBy(desc(postSchema.createdAt))
    .offset(offset)
    .limit(limit)

  return await query.all()
}

export const listFollowingPosts = async (userId: string, offset: number = 0, limit: number = 10) => {
  return await db
    .select({
      post: authPostSelect(userId),
      user: authUserSelect(userId),
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .innerJoin(followerSchema, eq(postSchema.userId, followerSchema.userId))
    .where(and(isNull(postSchema.parentId), eq(followerSchema.followerId, userId)))
    .orderBy(desc(postSchema.createdAt))
    .offset(offset)
    .limit(limit)
    .all()
}

export const listReplies = async (authorUsername: string, userId?: string) => {
  return await db
    .select({
      post: userId ? authPostSelect(userId) : publicPostSelect,
      user: userId ? authUserSelect(userId) : publicUserSelect,
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(and(isNotNull(postSchema.parentId), eq(userSchema.username, authorUsername)))
    .orderBy(desc(postSchema.createdAt))
    .all()
}

export const listReposts = async (username: string, currentUserId?: string) => {
  const userId = await db
    .select({ id: userSchema.id })
    .from(userSchema)
    .where(eq(userSchema.username, username))
    .get()
    .then((user) => user?.id)

  if (!userId) {
    throw new Error('User not found')
  }

  return await db
    .select({
      post: currentUserId ? authPostSelect(currentUserId) : publicPostSelect,
      user: currentUserId ? authUserSelect(currentUserId) : publicUserSelect,
      repost: {
        username: sql<string>`${username}`.as('username'),
        createdAt: repostSchema.createdAt,
      },
    })
    .from(repostSchema)
    .innerJoin(postSchema, eq(repostSchema.postId, postSchema.id))
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(eq(repostSchema.userId, userId))
    .orderBy(desc(repostSchema.createdAt))
    .all()
}

export const incrementReplyCount = async (tx: Transaction, postId: string) => {
  // Return the updated post so that we can save a query when creating a notification
  return await tx
    .update(postSchema)
    .set({ replyCount: sql`${postSchema.replyCount} + 1` })
    .where(eq(postSchema.id, postId))
    .returning()
    .get()
}

export const insertPost = async (userId: string, post: { text?: string; image?: string; parentId?: string }) => {
  return await db.transaction(async (tx) => {
    // Insert the post
    const newPost = await tx
      .insert(postSchema)
      .values({
        userId,
        ...post,
      })
      .returning()
      .get()

    // If this is a reply, increment the parent's reply count and create a notification
    if (post.parentId) {
      const parentPost = await incrementReplyCount(tx, post.parentId)
      // Only create a notification if the parent post is not the current user's post
      if (parentPost && parentPost.userId !== userId) {
        await tx.insert(notificationSchema).values({
          userId: parentPost.userId,
          type: 'REPLY',
          sourceUserId: userId,
          postId: parentPost.id,
          replyId: newPost.id,
        })
      }
    }

    return newPost
  })
}

export const getPublicPostWithReplies = async (postId: string) => {
  return await db
    .select({
      post: publicPostSelect,
      user: publicUserSelect,
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(
      or(
        eq(postSchema.id, postId),
        eq(postSchema.parentId, postId),
        eq(postSchema.id, sql`(SELECT ${postSchema.parentId} FROM ${postSchema} WHERE ${postSchema.id} = ${postId})`),
      ),
    )
    .orderBy(postSchema.createdAt)
    .all()
}

export const getAuthPostWithReplies = async (postId: string, userId: string) => {
  return await db
    .select({
      post: authPostSelect(userId),
      user: authUserSelect(userId),
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(
      or(
        eq(postSchema.id, postId),
        eq(postSchema.parentId, postId),
        eq(postSchema.id, sql`(SELECT ${postSchema.parentId} FROM ${postSchema} WHERE ${postSchema.id} = ${postId})`),
      ),
    )
    .orderBy(postSchema.createdAt)
    .all()
}

export const getPostById = async (id: string) => {
  return await db
    .select({
      post: publicPostSelect,
      user: publicUserSelect,
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(eq(postSchema.id, id))
    .get()
}

export const insertLike = async (postId: string, userId: string) => {
  await db.transaction(async (trx) => {
    // Get the post's user ID
    const post = await trx.select({ userId: postSchema.userId }).from(postSchema).where(eq(postSchema.id, postId)).get()

    if (!post) {
      throw new Error('Post not found')
    }

    // Add a like
    await trx.insert(likeSchema).values({ userId, postId })

    // Increment the like count
    await trx
      .update(postSchema)
      .set({ likeCount: sql`${postSchema.likeCount} + 1` })
      .where(eq(postSchema.id, postId))

    // Create a notification for the post's author
    if (post.userId !== userId) {
      const existingNotification = await trx
        .select()
        .from(notificationSchema)
        .where(
          and(
            eq(notificationSchema.userId, post.userId),
            eq(notificationSchema.sourceUserId, userId),
            eq(notificationSchema.type, 'LIKE'),
          ),
        )
        .get()
      if (!existingNotification) {
        await trx.insert(notificationSchema).values({
          userId: post.userId,
          sourceUserId: userId,
          postId,
          replyId: null,
          type: 'LIKE',
        })
      }
    }
  })
}

export const deleteLike = async (postId: string, userId: string) => {
  await db.transaction(async (trx) => {
    // Remove a like
    await trx.delete(likeSchema).where(and(eq(likeSchema.userId, userId), eq(likeSchema.postId, postId)))

    // Decrement the like count
    await trx
      .update(postSchema)
      .set({ likeCount: sql`${postSchema.likeCount} - 1` })
      .where(eq(postSchema.id, postId))
  })
}

export const insertRepost = async (postId: string, userId: string) => {
  await db.transaction(async (tx) => {
    // Get the post's user ID
    const post = await tx.select({ userId: postSchema.userId }).from(postSchema).where(eq(postSchema.id, postId)).get()

    if (!post) {
      throw new Error('Post not found')
    }

    await tx.insert(repostSchema).values({
      postId,
      userId,
    })
    await tx
      .update(postSchema)
      .set({ repostCount: sql`${postSchema.repostCount} + 1` })
      .where(eq(postSchema.id, postId))

    // Create a notification for the post's author
    if (post.userId !== userId) {
      const existingNotification = await tx
        .select()
        .from(notificationSchema)
        .where(
          and(
            eq(notificationSchema.userId, post.userId),
            eq(notificationSchema.sourceUserId, userId),
            eq(notificationSchema.type, 'REPOST'),
          ),
        )
        .get()
      if (!existingNotification) {
        await tx.insert(notificationSchema).values({
          userId: post.userId,
          type: 'REPOST',
          sourceUserId: userId,
          postId,
        })
      }
    }
  })
}

export const deleteRepost = async (postId: string, userId: string) => {
  await db.transaction(async (tx) => {
    await tx.delete(repostSchema).where(and(eq(repostSchema.postId, postId), eq(repostSchema.userId, userId)))
    await tx
      .update(postSchema)
      .set({ repostCount: sql`${postSchema.repostCount} - 1` })
      .where(eq(postSchema.id, postId))
  })
}

export const incrementShareCount = async (postId: string) => {
  await db
    .update(postSchema)
    .set({ shareCount: sql`${postSchema.shareCount} + 1` })
    .where(eq(postSchema.id, postId))
}

export const searchPosts = (searchTerm: string, userId?: string, limit: number = 8) => {
  const query = db
    .select({
      post: userId ? authPostSelect(userId) : publicPostSelect,
      user: userId ? authUserSelect(userId) : publicUserSelect,
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(and(isNull(postSchema.parentId), sql`LOWER(${postSchema.text}) LIKE LOWER(${`%${searchTerm}%`})`))
    .orderBy(desc(postSchema.createdAt))
    .limit(limit)

  return query.all()
}

export const deletePost = async (postId: string) => {
  await db.transaction(async (tx) => {
    // Get the post's parent ID before deletion
    const post = await tx
      .select({ parentId: postSchema.parentId })
      .from(postSchema)
      .where(eq(postSchema.id, postId))
      .get()

    // Delete the post (related records will be deleted via cascade)
    await tx.delete(postSchema).where(eq(postSchema.id, postId))

    // If this was a reply, decrement the parent's reply count
    if (post?.parentId) {
      await tx
        .update(postSchema)
        .set({ replyCount: sql`${postSchema.replyCount} - 1` })
        .where(eq(postSchema.id, post.parentId))
    }
  })
}

/**
 * Reports a post for moderation
 * @param userId - The ID of the user reporting the post
 * @param postId - The ID of the post being reported
 * @param authorId - The ID of the post's author
 */
export const reportPost = async (userId: string, postId: string, authorId: string) => {
  await db.insert(reportedPostSchema).values({ userId, postId, authorId })
}

export const updateReportedPostStatus = async (
  userId: string,
  postId: string,
  status: keyof typeof reportedPostStatusEnum,
) => {
  await db
    .update(reportedPostSchema)
    .set({ status, userId })
    .where(and(eq(reportedPostSchema.postId, postId), eq(reportedPostSchema.userId, userId)))
}
