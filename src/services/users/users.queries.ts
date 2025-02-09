import { redirect } from 'next/navigation'
import { cache } from 'react'

import { DEFAULT_ERROR, ROUTES } from '@/lib/constants'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'
import {
  findUserByField,
  getAuthUserDetails,
  getNotifications as getNotificationsDb,
  getPublicUserDetails,
  getUnseenNotificationsCount as getUnseenNotificationsCountDb,
  markNotificationsAsSeen as markNotificationsAsSeenDb,
  searchUsers as searchUsersDb,
} from '@/repositories/users.repository'

export type PostUser = {
  id: string
  username: string
  name: string
  avatar: string | null
  bio: string | null
  followerCount: number
  isFollowed: boolean
  isFollower: boolean
}

/*
 * Is Unique Field
 */
export const isUniqueUserField = async (field: 'email' | 'username', value: string) => {
  const user = await findUserByField(field, value)
  return !user
}

/*
 * Get user info
 */
const getAuthUserInfoCached = cache(async (username: string): Promise<{ user: PostUser } | { error: string }> => {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return redirect(ROUTES.LOGIN)
    }
    const userInfo = await getAuthUserDetails(username, user.id)

    if (!userInfo) {
      return { error: 'User not found' }
    }

    return {
      user: {
        id: userInfo.id,
        username: userInfo.username,
        name: userInfo.name,
        avatar: userInfo.avatar,
        bio: userInfo.bio,
        followerCount: userInfo.followerCount,
        isFollowed: Boolean(userInfo.isFollowed),
        isFollower: Boolean(userInfo.isFollower),
      },
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Failed to fetch user info' }
  }
})

export const getUserInfo = getAuthUserInfoCached

/*
 * Get public user info
 */
const getPublicUserInfoCached = cache(async (username: string): Promise<{ user: PostUser } | { error: string }> => {
  try {
    const userInfo = await getPublicUserDetails(username)

    if (!userInfo) {
      return { error: 'User not found' }
    }
    return {
      user: {
        id: userInfo.id,
        username: userInfo.username,
        name: userInfo.name,
        avatar: userInfo.avatar,
        bio: userInfo.bio,
        followerCount: userInfo.followerCount,
        isFollowed: Boolean(userInfo.isFollowed),
        isFollower: Boolean(userInfo.isFollower),
      },
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Failed to fetch user info' }
  }
})

export const getPublicUserInfo = getPublicUserInfoCached

/*
 * Search Users
 */
export const searchUsers = async (query: string) => {
  try {
    const { user } = await validateRequest()
    const results = await searchUsersDb(query, user?.id)
    return {
      users: results.map((user) => ({
        ...user,
        isFollowed: Boolean(user.isFollowed),
      })),
    }
  } catch (err) {
    logger.error(err)
    return { error: DEFAULT_ERROR }
  }
}

/*
 * Get notifications
 */
export const getNotifications = async (options?: { seen?: boolean }) => {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return redirect(ROUTES.LOGIN)
    }
    return await getNotificationsDb(user.id, options)
  } catch (err) {
    logger.error(err)
    return { error: DEFAULT_ERROR }
  }
}

/*
 * Get unseen notifications count
 */
export const getUnseenNotificationsCount = async () => {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return redirect(ROUTES.LOGIN)
    }
    return await getUnseenNotificationsCountDb(user.id)
  } catch (err) {
    logger.error(err)
    return { error: DEFAULT_ERROR }
  }
}

/*
 * Mark notifications as seen
 */
export const markNotificationsAsSeen = async () => {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return redirect(ROUTES.LOGIN)
    }
    return await markNotificationsAsSeenDb(user.id)
  } catch (err) {
    logger.error(err)
    return { error: DEFAULT_ERROR }
  }
}
