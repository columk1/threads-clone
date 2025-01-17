import { and, desc, eq, isNotNull, isNull, or, sql, type SQLWrapper } from 'drizzle-orm'

import { db } from './Drizzle'
import {
  emailVerificationCodeSchema,
  followerSchema,
  likeSchema,
  type Post,
  postSchema,
  repostSchema,
  type User,
  userSchema,
} from './Schema'

export const baseUserSelect = {
  id: userSchema.id,
  username: userSchema.username,
  name: userSchema.name,
  avatar: userSchema.avatar,
  bio: userSchema.bio,
  followerCount: userSchema.followerCount,
}

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

type UserField = keyof User

export type PostData = Post & { isLiked: boolean; isReposted: boolean }

export const findUserByField = async (field: UserField, value: string) => {
  return await db.select().from(userSchema).where(eq(userSchema[field], value)).get()
}

export const getUserById = async (id: string) => {
  return await db.select().from(userSchema).where(eq(userSchema.id, id)).get()
}

type NewUserParams = {
  id: string
  email: string
  emailVerified: number
  password: string
  name: string
  username: string
}

export const createUser = async (user: NewUserParams) => {
  return await db.insert(userSchema).values(user).returning().get()
}

export const getLatestVerificationCode = async (userId: string) => {
  const lastSent = await db.query.emailVerificationCodeSchema.findFirst({
    where: (Schema, { eq }) => eq(Schema.userId, userId),
    columns: { expiresAt: true },
  })
  return lastSent
}

export const createEmailVerificationCode = async (userId: string, code: string, expiresAt: number) => {
  await db.delete(emailVerificationCodeSchema).where(eq(emailVerificationCodeSchema.userId, userId))

  await db.insert(emailVerificationCodeSchema).values({
    code,
    expiresAt,
    userId,
  })
}

export const getEmailVerificationCode = async (code: string) => {
  return await db.select().from(emailVerificationCodeSchema).where(eq(emailVerificationCodeSchema.code, code)).get()
}

export const updateEmailVerified = async (userId: string) => {
  await db.update(userSchema).set({ emailVerified: 1 }).where(eq(userSchema.id, userId))
}

export const deleteEmailVerificationCode = async (id: string) => {
  await db.delete(emailVerificationCodeSchema).where(eq(emailVerificationCodeSchema.id, id))
}

export const getUserByEmail = async (email: string) => {
  return await db.select().from(userSchema).where(eq(userSchema.email, email)).get()
}

export const getFollowerCount = async (userId: string) => {
  return await db
    .select({ followerCount: userSchema.followerCount })
    .from(userSchema)
    .where(eq(userSchema.id, userId))
    .get()
}

export const handleFollow = async (userId: string, followerId: string, action: 'follow' | 'unfollow') => {
  const targetUser = await getFollowerCount(userId)
  if (!targetUser) {
    throw new Error('User not found')
  }
  await db.transaction(async (tx) => {
    if (action === 'follow') {
      await tx.insert(followerSchema).values({
        userId,
        followerId,
      })
      // Update follower count
      await tx
        .update(userSchema)
        .set({ followerCount: targetUser.followerCount + 1 })
        .where(eq(userSchema.id, userId))
    } else {
      // unfollow branch
      await tx
        .delete(followerSchema)
        .where(and(eq(followerSchema.userId, userId), eq(followerSchema.followerId, followerId)))
      // Update follower count
      await tx
        .update(userSchema)
        .set({ followerCount: targetUser.followerCount - 1 })
        .where(eq(userSchema.id, userId))
    }
  })
}

export const getFollowStatus = async (targetUserId: string, userId: string) => {
  const result = await db
    .select({
      isFollowed: sql<boolean>`EXISTS (
      SELECT 1 
      FROM ${followerSchema} 
      WHERE ${followerSchema.userId} = (
        SELECT id FROM ${userSchema} WHERE id = ${targetUserId}
      )
      AND ${followerSchema.followerId} = ${userId}
      LIMIT 1
    )`.as('isFollowed'),
    })
    .from(userSchema)
    .where(eq(userSchema.id, targetUserId))
    .get()

  return Boolean(result?.isFollowed)
}

export const getAuthUserDetails = async (targetUsername: string, userId: string) => {
  return await db
    .select({
      ...baseUserSelect,
      isFollowed: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id}
          AND ${followerSchema.followerId} = ${userId}
          LIMIT 1
        )`.as('isFollowed'),
    })
    .from(userSchema)
    .where(eq(userSchema.username, targetUsername))
    .get()
}

export const getPublicUserDetails = async (username: string) => {
  return await db
    .select({
      ...baseUserSelect,
      isFollowed: sql<boolean>`false`,
    })
    .from(userSchema)
    .where(eq(userSchema.username, username))
    .get()
}

export const updateUserAvatar = async (userId: string, url: string) => {
  await db.update(userSchema).set({ avatar: url }).where(eq(userSchema.id, userId))
}

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

export const listPosts = async (authorUsername?: string, userId: string = '') => {
  const filters: SQLWrapper[] = [isNull(postSchema.parentId)]

  if (authorUsername) {
    filters.push(eq(userSchema.username, authorUsername))
  }

  const query = db
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
    .where(and(...filters))
    .orderBy(desc(postSchema.createdAt))
    .$dynamic()

  return await query.all()
}

export const listFollowingPosts = async (userId: string) => {
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
  const userId = await findUserByField('username', username).then((user) => user?.id)
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

// export const listFollowingPostsAndReposts = async (userId: string, limit = 20) => {
//   // First, create a CTE (Common Table Expression) that unions posts and reposts
//   const postsAndReposts = db.$with('posts_and_reposts').as(
//     db.select({
//       id: postSchema.id,
//       activityTime: postSchema.createdAt,
//       actorId: postSchema.userId,
//       isRepost: sql<boolean>`false`,
//     })
//     .from(postSchema)
//     .innerJoin(followerSchema, eq(postSchema.userId, followerSchema.userId))
//     .where(eq(followerSchema.followerId, userId))
//     .union(
//       db.select({
//         id: postSchema.id,
//         activityTime: repostSchema.createdAt,
//         actorId: repostSchema.userId,
//         isRepost: sql<boolean>`true`,
//       })
//       .from(repostSchema)
//       .innerJoin(followerSchema, eq(repostSchema.userId, followerSchema.userId))
//       .innerJoin(postSchema, eq(repostSchema.postId, postSchema.id))
//       .where(eq(followerSchema.followerId, userId))
//     )
//   )

//   // Then use this CTE to get the full post details
//   return await db
//     .with(postsAndReposts)
//     .select({
//       post: {
//         ...basePostSelect,
//         isLiked: sql<boolean>`EXISTS (
//           SELECT 1 FROM ${likeSchema}
//           WHERE ${likeSchema.userId} = ${userId}
//             AND ${likeSchema.postId} = ${postSchema.id}
//         )`.as('isLiked'),
//         isReposted: sql<boolean>`EXISTS (
//           SELECT 1 FROM ${repostSchema}
//           WHERE ${repostSchema.userId} = ${userId}
//             AND ${repostSchema.postId} = ${postSchema.id}
//         )`.as('isReposted'),
//       },
//       user: {
//         ...baseUserSelect,
//         isFollowed: sql<boolean>`EXISTS (
//           SELECT 1 FROM ${followerSchema}
//           WHERE ${followerSchema.userId} = ${userSchema.id}
//             AND ${followerSchema.followerId} = ${userId}
//         )`.as('isFollowed'),
//       },
//       repostedBy: {
//         id: sql<string>`CASE
//           WHEN posts_and_reposts.is_repost
//           THEN posts_and_reposts.actor_id
//           ELSE NULL
//         END`.as('id'),
//         createdAt: sql<string>`CASE
//           WHEN posts_and_reposts.is_repost
//           THEN posts_and_reposts.activity_time
//           ELSE NULL
//         END`.as('createdAt'),
//       },
//       activityTime: postsAndReposts.activityTime,
//     })
//     .from(postsAndReposts)
//     .innerJoin(postSchema, eq(postsAndReposts.id, postSchema.id))
//     .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
//     .orderBy(desc(postsAndReposts.activityTime))
//     .limit(limit)
//     .all()
// }
