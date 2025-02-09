import { aliasedTable, and, count, desc, eq, or, sql } from 'drizzle-orm'
import { ulid } from 'ulidx'

import { db } from '../lib/db/Drizzle'
import {
  followerSchema,
  likeSchema,
  notificationSchema,
  postSchema,
  repostSchema,
  type User,
  userSchema,
} from '../lib/db/Schema'
import { basePostSelect, baseUserSelect, getAliasedBasePostSelect } from '../lib/db/selectors'

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
    if (action === 'follow') {
      const existingNotification = await tx
        .select()
        .from(notificationSchema)
        .where(
          and(
            eq(notificationSchema.type, 'FOLLOW'),
            eq(notificationSchema.userId, userId),
            eq(notificationSchema.sourceUserId, followerId),
          ),
        )
        .get()
      if (!existingNotification) {
        await tx.insert(notificationSchema).values({
          userId,
          type: 'FOLLOW',
          sourceUserId: followerId,
          seen: false,
        })
      }
      // Don't recreate notifications
      // .onConflictDoNothing({
      //   target: [
      //     notificationSchema.userId,
      //     notificationSchema.sourceUserId,
      //     notificationSchema.type,
      //     sql`ifnull(${notificationSchema.postId}, '')`, // Null is unique in SQLite
      //     sql`ifnull(${notificationSchema.replyId}, '')`, // Null is unique in SQLite
      //   ],
      // })
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
      isFollower: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userId}
          AND ${followerSchema.followerId} = ${userSchema.id}
          LIMIT 1
        )`.as('isFollower'),
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

export const searchUsers = async (query: string, userId?: string, limit: number = 10) => {
  const searchTerm = `%${query}%`
  const startsWithTerm = `${query}%`

  return await db
    .select({
      ...baseUserSelect,
      ...(userId && {
        isFollowed: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id} 
            AND ${followerSchema.followerId} = ${userId}
        )`.as('isFollowed'),
        isFollower: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userId} 
            AND ${followerSchema.followerId} = ${userSchema.id}
        )`.as('isFollower'),
      }),
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

const reply = aliasedTable(postSchema, 'reply')
const replySelect = getAliasedBasePostSelect(reply)

export const getNotifications = async (userId: string, options?: { seen?: boolean }) => {
  const seenCondition = options?.seen !== undefined ? eq(notificationSchema.seen, options.seen) : undefined
  return await db
    .select({
      notification: notificationSchema,
      sourceUser: {
        ...baseUserSelect,
        isFollowed: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id} 
            AND ${followerSchema.followerId} = ${userId}
        )`.as('isFollowed'),
        isFollower: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userId} 
            AND ${followerSchema.followerId} = ${userSchema.id}
        )`.as('isFollower'),
      },
      post: basePostSelect,
      reply: {
        ...replySelect,
        isLiked: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${likeSchema} 
          WHERE ${likeSchema.postId} = ${reply.id} 
            AND ${likeSchema.userId} = ${userId}
        )`.as('isLiked'),
        isReposted: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${repostSchema} 
          WHERE ${repostSchema.postId} = ${reply.id} 
            AND ${repostSchema.userId} = ${userId}
        )`.as('isReposted'),
      },
    })
    .from(notificationSchema)
    .where(
      and(eq(notificationSchema.userId, userId), seenCondition, sql`${notificationSchema.sourceUserId} IS NOT NULL`),
    )
    .innerJoin(userSchema, eq(notificationSchema.sourceUserId, userSchema.id))
    .leftJoin(postSchema, eq(notificationSchema.postId, postSchema.id))
    // .leftJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .leftJoin(reply, and(eq(notificationSchema.type, 'REPLY'), eq(notificationSchema.replyId, reply.id)))
    .orderBy(desc(notificationSchema.createdAt))
    .limit(50)
    .all()
}

export type Notification = Awaited<ReturnType<typeof getNotifications>>[number]

/**
 * Get the count of unseen notifications for a user
 * @param userId - The ID of the user to count notifications for
 * @returns The number of unseen notifications
 */
export const getUnseenNotificationsCount = async (userId: string): Promise<number> => {
  const result = await db
    .select({
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(notificationSchema)
    .where(
      and(
        eq(notificationSchema.userId, userId),
        eq(notificationSchema.seen, false),
        sql`${notificationSchema.sourceUserId} IS NOT NULL`,
      ),
    )
    .get()

  return result?.count ?? 0
}

export const markNotificationsAsSeen = async (userId: string) => {
  await db
    .update(notificationSchema)
    .set({ seen: true })
    .where(and(eq(notificationSchema.userId, userId), eq(notificationSchema.seen, false)))
}

/**
 * Get unseen notifications for a user
 * @param userId - The ID of the user to get notifications for
 * @returns An array of unseen notifications with their associated data
 */
export const getUnseenNotifications = async (userId: string) => {
  return await db
    .select({
      notification: notificationSchema,
      sourceUser: {
        ...baseUserSelect,
      },
      post: basePostSelect,
      reply: replySelect,
    })
    .from(notificationSchema)
    .where(
      and(
        eq(notificationSchema.userId, userId),
        eq(notificationSchema.seen, false),
        sql`${notificationSchema.sourceUserId} IS NOT NULL`,
      ),
    )
    .leftJoin(userSchema, eq(notificationSchema.sourceUserId, userSchema.id))
    .leftJoin(postSchema, and(eq(notificationSchema.type, 'LIKE'), eq(notificationSchema.postId, postSchema.id)))
    .leftJoin(reply, and(eq(notificationSchema.type, 'REPLY'), eq(notificationSchema.replyId, reply.id)))
    .orderBy(desc(notificationSchema.createdAt))
    .all()
}

/**
 * Marks all unseen notifications as seen for a given user
 * @param userId - The ID of the user whose notifications should be marked as seen
 * @returns The number of notifications that were marked as seen
 */
export const markNotificationsAsSeenDb = async (userId: string): Promise<{ count: number }> => {
  return await db
    .update(notificationSchema)
    .set({ seen: true })
    .where(and(eq(notificationSchema.userId, userId), eq(notificationSchema.seen, false)))
    .returning({
      count: count(),
    })
    .get()
}
