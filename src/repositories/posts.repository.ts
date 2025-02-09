import type { SQLWrapper } from 'drizzle-orm'
import { and, desc, eq, isNotNull, isNull, or, sql } from 'drizzle-orm'

import { db } from '../lib/db/Drizzle'
import { followerSchema, likeSchema, type Post, postSchema, repostSchema, userSchema } from '../lib/db/Schema'
import { baseUserSelect } from './users.repository'

export const basePostSelect = {
  id: postSchema.id,
  text: postSchema.text,
  image: postSchema.image,
  imageWidth: postSchema.imageWidth,
  imageHeight: postSchema.imageHeight,
  userId: postSchema.userId,
  parentId: postSchema.parentId,
  likeCount: postSchema.likeCount,
  replyCount: postSchema.replyCount,
  repostCount: postSchema.repostCount,
  shareCount: postSchema.shareCount,
  createdAt: postSchema.createdAt,
}

export type PostData = Post & { isLiked: boolean; isReposted: boolean }

export const listPublicPosts = async (authorUsername?: string) => {
  const query = db
    .select({
      post: {
        ...basePostSelect,
        isLiked: sql<boolean>`false`,
        isReposted: sql<boolean>`false`,
      },
      user: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`false`,
      },
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

export const listPosts = async (username?: string, userId?: string, offset: number = 0, limit: number = 8) => {
  const filters: SQLWrapper[] = [isNull(postSchema.parentId)]
  if (username) {
    filters.push(eq(userSchema.username, username))
  }

  const query = db
    .select({
      post: {
        ...basePostSelect,
        isLiked: userId
          ? sql<boolean>`EXISTS (
            SELECT 1 
            FROM ${likeSchema} 
            WHERE ${likeSchema.userId} = ${userId} 
              AND ${likeSchema.postId} = ${postSchema.id}
          )`.as('isLiked')
          : sql<boolean>`false`,
        isReposted: userId
          ? sql<boolean>`EXISTS (
            SELECT 1 
            FROM ${repostSchema} 
            WHERE ${repostSchema.userId} = ${userId} 
              AND ${repostSchema.postId} = ${postSchema.id}
          )`.as('isReposted')
          : sql<boolean>`false`,
      },
      user: {
        ...baseUserSelect,
        isFollowed: userId
          ? sql<boolean>`EXISTS (
            SELECT 1 
            FROM ${followerSchema} 
            WHERE ${followerSchema.userId} = ${userSchema.id} 
              AND ${followerSchema.followerId} = ${userId}
          )`.as('isFollowed')
          : sql<boolean>`false`,
      },
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
      post: {
        ...basePostSelect,
        isLiked: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${likeSchema} 
          WHERE ${likeSchema.userId} = ${userId} 
            AND ${likeSchema.postId} = ${postSchema.id}
        )`.as('isLiked'),
        isReposted: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${repostSchema} 
          WHERE ${repostSchema.userId} = ${userId} 
            AND ${repostSchema.postId} = ${postSchema.id}
        )`.as('isReposted'),
      },
      user: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id} 
            AND ${followerSchema.followerId} = ${userId}
        )`.as('isFollowed'),
      },
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

export const listReplies = async (authorUsername: string, userId: string = '') => {
  return await db
    .select({
      post: {
        ...basePostSelect,
        isLiked: sql<boolean>`EXISTS (
          SELECT 1
          FROM ${likeSchema}
          WHERE ${likeSchema.userId} = ${userId}
            AND ${likeSchema.postId} = ${postSchema.id}
        )`.as('isLiked'),
        isReposted: sql<boolean>`EXISTS (
          SELECT 1
          FROM ${repostSchema}
          WHERE ${repostSchema.userId} = ${userId}
            AND ${repostSchema.postId} = ${postSchema.id}
        )`.as('isReposted'),
      },
      user: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`EXISTS (
          SELECT 1
          FROM ${followerSchema}
          WHERE ${followerSchema.userId} = ${userSchema.id}
            AND ${followerSchema.followerId} = ${userId}
        )`.as('isFollowed'),
      },
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(and(isNotNull(postSchema.parentId), eq(userSchema.username, authorUsername)))
    .orderBy(desc(postSchema.createdAt))
    .all()
}

export const listReposts = async (username: string, currentUserId: string = '') => {
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
      post: {
        ...basePostSelect,
        isLiked: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${likeSchema} 
          WHERE ${likeSchema.userId} = ${currentUserId} 
            AND ${likeSchema.postId} = ${postSchema.id}
        )`.as('isLiked'),
        isReposted: sql<boolean>`true`.as('isReposted'),
      },
      user: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id} 
            AND ${followerSchema.followerId} = ${currentUserId}
        )`.as('isFollowed'),
      },
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

export const incrementReplyCount = async (tx: any, postId: string) => {
  await tx
    .update(postSchema)
    .set({ replyCount: sql`${postSchema.replyCount} + 1` })
    .where(eq(postSchema.id, postId))
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

    // If this is a reply, increment the parent's reply count
    if (post.parentId) {
      await incrementReplyCount(tx, post.parentId)
    }

    return newPost
  })
}

export const getPublicPostWithReplies = async (postId: string) => {
  return await db
    .select({
      post: {
        ...basePostSelect,
        isLiked: sql<boolean>`false`,
        isReposted: sql<boolean>`false`,
      },
      user: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`false`,
      },
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(or(eq(postSchema.id, postId), eq(postSchema.parentId, postId)))
    .orderBy(postSchema.createdAt)
    .all()
}

export const getAuthPostWithReplies = async (postId: string, userId: string) => {
  return await db
    .select({
      post: {
        ...basePostSelect,
        isLiked: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${likeSchema} 
          WHERE ${likeSchema.userId} = ${userId} 
            AND ${likeSchema.postId} = ${postSchema.id}
        )`.as('isLiked'),
        isReposted: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${repostSchema} 
          WHERE ${repostSchema.userId} = ${userId} 
            AND ${repostSchema.postId} = ${postSchema.id}
        )`.as('isReposted'),
      },
      user: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id}
            AND ${followerSchema.followerId} = ${userId}
        )`.as('isFollowed'),
      },
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(or(eq(postSchema.id, postId), eq(postSchema.parentId, postId)))
    .orderBy(postSchema.createdAt)
    .all()
}

export const getPostById = async (id: string) => {
  return await db
    .select({
      post: {
        ...basePostSelect,
        isLiked: sql<boolean>`false`,
        isReposted: sql<boolean>`false`,
      },
      user: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`false`,
      },
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(eq(postSchema.id, id))
    .get()
}

export const insertLike = async (postId: string, userId: string) => {
  await db.transaction(async (trx) => {
    // Add a like
    await trx.insert(likeSchema).values({ userId, postId })

    // Increment the like count
    await trx
      .update(postSchema)
      .set({ likeCount: sql`${postSchema.likeCount} + 1` })
      .where(eq(postSchema.id, postId))
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
    await tx.insert(repostSchema).values({
      postId,
      userId,
    })
    await tx
      .update(postSchema)
      .set({ repostCount: sql`${postSchema.repostCount} + 1` })
      .where(eq(postSchema.id, postId))
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
      post: {
        ...basePostSelect,
        isLiked: userId
          ? sql<boolean>`EXISTS (
            SELECT 1 
            FROM ${likeSchema} 
            WHERE ${likeSchema.userId} = ${userId} 
              AND ${likeSchema.postId} = ${postSchema.id}
          )`.as('isLiked')
          : sql<boolean>`false`,
        isReposted: userId
          ? sql<boolean>`EXISTS (
            SELECT 1 
            FROM ${repostSchema} 
            WHERE ${repostSchema.userId} = ${userId} 
              AND ${repostSchema.postId} = ${postSchema.id}
          )`.as('isReposted')
          : sql<boolean>`false`,
      },
      user: {
        ...baseUserSelect,
        isFollowed: userId
          ? sql<boolean>`EXISTS (
            SELECT 1 
            FROM ${followerSchema} 
            WHERE ${followerSchema.userId} = ${userSchema.id} 
              AND ${followerSchema.followerId} = ${userId}
          )`.as('isFollowed')
          : sql<boolean>`false`,
      },
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(and(isNull(postSchema.parentId), sql`LOWER(${postSchema.text}) LIKE LOWER(${`%${searchTerm}%`})`))
    .orderBy(desc(postSchema.createdAt))
    .limit(limit)

  return query.all()
}

export const deletePost = async (postId: string) => {
  // All related records (replies, likes, reposts) will be deleted automatically via cascade
  return await db.delete(postSchema).where(eq(postSchema.id, postId))
}
