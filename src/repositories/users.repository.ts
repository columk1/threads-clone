import { and, eq, or, sql } from 'drizzle-orm'
import { ulid } from 'ulidx'

import { db } from '../lib/db/Drizzle'
import { followerSchema, type User, userSchema } from '../lib/db/Schema'

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

export const searchUsers = async (query: string, userId?: string, limit: number = 10) => {
  const searchTerm = `%${query}%`
  const startsWithTerm = `${query}%`

  return await db
    .select({
      ...baseUserSelect,
      isFollowed: userId
        ? sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id} 
            AND ${followerSchema.followerId} = ${userId}
        )`.as('isFollowed')
        : sql<boolean>`false`,
      priority: sql<number>`
        CASE 
          WHEN lower(${userSchema.username}) LIKE lower(${startsWithTerm}) THEN 1
          WHEN lower(${userSchema.name}) LIKE lower(${startsWithTerm}) THEN 2
          WHEN lower(${userSchema.username}) LIKE lower(${searchTerm}) THEN 3
          WHEN lower(${userSchema.name}) LIKE lower(${searchTerm}) THEN 4
          ELSE 5
        END`.as('priority'),
    })
    .from(userSchema)
    .where(
      or(
        sql`lower(${userSchema.username}) LIKE lower(${searchTerm})`,
        sql`lower(${userSchema.name}) LIKE lower(${searchTerm})`,
      ),
    )
    .orderBy(sql`priority`)
    .limit(limit)
    .all()
}

export const getUserByGoogleId = async (googleId: string) => {
  return await db.select().from(userSchema).where(eq(userSchema.googleId, googleId)).get()
}

export const getUserByUsername = async (username: string) => {
  return await db.select().from(userSchema).where(eq(userSchema.username, username)).get()
}

type NewGoogleUserParams = {
  googleId: string
  email: string
  name: string
  username: string
  emailVerified: number
  avatar?: string
}

export const createGoogleUser = async (user: NewGoogleUserParams) => {
  return await db
    .insert(userSchema)
    .values({
      ...user,
      id: ulid(),
      password: '', // Google users don't need a password
    })
    .returning()
    .get()
}

export const deleteUser = async (userId: string) => {
  // This should cascade to delete: sessions, email verification codes,
  // posts (which will cascade to likes and reposts) and followers
  return await db.delete(userSchema).where(eq(userSchema.id, userId))
}

export const updateUserBio = async (userId: string, bio: string) => {
  await db.update(userSchema).set({ bio }).where(eq(userSchema.id, userId))
}
