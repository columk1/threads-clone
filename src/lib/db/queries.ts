import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'

import { db } from './Drizzle'
import { emailVerificationCodeSchema, followerSchema, likeSchema, postSchema, type User, userSchema } from './Schema'

export const baseUserSelect = {
  id: userSchema.id,
  username: userSchema.username,
  name: userSchema.name,
  avatar: userSchema.avatar,
  bio: userSchema.bio,
  followerCount: userSchema.followerCount,
}

type UserField = keyof User

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

export const getUserIdAndFollowerCount = async (username: string) => {
  return await db
    .select({ id: userSchema.id, followerCount: userSchema.followerCount })
    .from(userSchema)
    .where(eq(userSchema.username, username))
    .get()
}

export const handleFollow = async (username: string, followerId: string, action: 'follow' | 'unfollow') => {
  const targetUser = await getUserIdAndFollowerCount(username)
  if (!targetUser) {
    throw new Error('User not found')
  }
  await db.transaction(async (tx) => {
    if (action === 'follow') {
      await tx.insert(followerSchema).values({
        userId: targetUser.id,
        followerId,
      })
      // Update follower count
      await tx
        .update(userSchema)
        .set({ followerCount: targetUser.followerCount + 1 })
        .where(eq(userSchema.id, targetUser.id))
    } else {
      // unfollow branch
      await tx
        .delete(followerSchema)
        .where(and(eq(followerSchema.userId, targetUser.id), eq(followerSchema.followerId, followerId)))
      // Update follower count
      await tx
        .update(userSchema)
        .set({ followerCount: targetUser.followerCount - 1 })
        .where(eq(userSchema.id, targetUser.id))
    }
  })
}

export const getFollowStatus = async (targetUsername: string, userId: string) => {
  const result = await db
    .select({
      isFollowed: sql<boolean>`EXISTS (
      SELECT 1 
      FROM ${followerSchema} 
      WHERE ${followerSchema.userId} = (
        SELECT id FROM ${userSchema} WHERE username = ${targetUsername}
      )
      AND ${followerSchema.followerId} = ${userId}
      LIMIT 1
    )`.as('isFollowed'),
    })
    .from(userSchema)
    .where(eq(userSchema.username, targetUsername))
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
  return await db.select(baseUserSelect).from(userSchema).where(eq(userSchema.username, username)).get()
}

export const updateUserAvatar = async (userId: string, url: string) => {
  await db.update(userSchema).set({ avatar: url }).where(eq(userSchema.id, userId))
}

export const listPublicPosts = async (authorUsername?: string) => {
  const query = db
    .select({
      post: postSchema,
      user: {
        username: userSchema.username,
        name: userSchema.name,
        avatar: userSchema.avatar,
        bio: userSchema.bio,
        followerCount: userSchema.followerCount,
        isFollowed: sql`false`,
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

export const listAuthPosts = async (userId: string, authorUsername?: string) => {
  const query = db
    .select({
      post: postSchema,
      user: {
        username: userSchema.username,
        name: userSchema.name,
        avatar: userSchema.avatar,
        bio: userSchema.bio,
        followerCount: userSchema.followerCount,
        isFollowed: sql<boolean>`EXISTS (
      SELECT 1 
      FROM ${followerSchema} 
      WHERE ${followerSchema.userId} = ${userSchema.id} 
        AND ${followerSchema.followerId} = ${userId}
    )`.as('isFollowed'),
      },
      isLiked: sql<boolean>`EXISTS (
      SELECT 1 
      FROM ${likeSchema} 
      WHERE ${likeSchema.userId} = ${userId} 
        AND ${likeSchema.postId} = ${postSchema.id}
    )`.as('isLiked'),
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

export const listFollowingPosts = async (userId: string) => {
  return await db
    .select({
      post: postSchema,
      user: {
        username: userSchema.username,
        name: userSchema.name,
        avatar: userSchema.avatar,
        bio: userSchema.bio,
        followerCount: userSchema.followerCount,
        isFollowed: sql<boolean>`EXISTS (
        SELECT 1 
        FROM ${followerSchema} 
        WHERE ${followerSchema.userId} = ${userSchema.id} 
          AND ${followerSchema.followerId} = ${userId}
      )`.as('isFollowed'),
      },
      isLiked: sql<boolean>`EXISTS (
      SELECT 1 
      FROM ${likeSchema} 
      WHERE ${likeSchema.userId} = ${userId} 
        AND ${likeSchema.postId} = ${postSchema.id}
    )`.as('isLiked'),
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .innerJoin(followerSchema, eq(postSchema.userId, followerSchema.userId))
    .where(and(isNull(postSchema.parentId), eq(followerSchema.followerId, userId)))
    .orderBy(desc(postSchema.createdAt))
    .all()
}

export const insertPost = async (userId: string, post: { text?: string; image?: string; parentId?: string }) => {
  return await db.insert(postSchema).values({
    userId,
    ...post,
  })
}

export const getPublicPostWithReplies = async (postId: string) => {
  return await db
    .select({
      post: postSchema,
      user: baseUserSelect,
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
      post: postSchema,
      user: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id}
            AND ${followerSchema.followerId} = ${userId}
        )`.as('isFollowed'),
      },
      isLiked: sql<boolean>`EXISTS (
        SELECT 1 
        FROM ${likeSchema} 
        WHERE ${likeSchema.userId} = ${userId} 
          AND ${likeSchema.postId} = ${postSchema.id}
      )`.as('isLiked'),
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
      post: postSchema,
      user: baseUserSelect,
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(eq(postSchema.id, id))
    .get()
}

export const insertLikeAndUpdateCount = async (postId: string, userId: string) => {
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

export const deleteLikeAndUpdateCount = async (postId: string, userId: string) => {
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
