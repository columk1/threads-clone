import { and, desc, eq, isNull, sql } from 'drizzle-orm'

import { db } from './Drizzle'
import { emailVerificationCodeSchema, followerSchema, likeSchema, postSchema, type User, userSchema } from './Schema'

export const insertEmailVerificationCode = async (userId: string, code: string, expiresAt: number) => {
  await db.delete(emailVerificationCodeSchema).where(eq(emailVerificationCodeSchema.userId, userId))

  await db.insert(emailVerificationCodeSchema).values({
    code,
    expiresAt,
    userId,
  })
}

type UserField = keyof User

export const getUserByField = async (field: UserField, value: string) => {
  const user = await db.select().from(userSchema).where(eq(userSchema[field], value))
  return user[0]
}

type NewUserParams = {
  id: string
  email: string
  emailVerified: number
  password: string
  name: string
  username: string
}

export const insertUser = async (user: NewUserParams) => {
  const newUser = await db.insert(userSchema).values(user).returning()
  return newUser[0]
}

export const getEmailVerificationCode = async (userId: string) => {
  const lastSent = await db.query.emailVerificationCodeSchema.findFirst({
    where: (Schema, { eq }) => eq(Schema.userId, userId),
    columns: { expiresAt: true },
  })
  return lastSent
}

export const getUserByEmail = async (email: string) => {
  const user = await db.select().from(userSchema).where(eq(userSchema.email, email))
  return user[0]
}

export const getAllPostsPublic = async (authorUsername?: string) => {
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

export const getAllPostsAuth = async (userId: string, authorUsername?: string) => {
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

export const getFollowingPostsByUserId = async (userId: string) => {
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
  return await db
    .insert(postSchema)
    .values({
      userId,
      ...post,
    })
    .returning()
}

export const getUserIdAndFollowerCountByUsername = async (username: string) => {
  return await db
    .select({ id: userSchema.id, followerCount: userSchema.followerCount })
    .from(userSchema)
    .where(eq(userSchema.username, username))
    .get()
}

export const createOrDeleteFollow = async (username: string, followerId: string, action: 'follow' | 'unfollow') => {
  const targetUser = await getUserIdAndFollowerCountByUsername(username)
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
