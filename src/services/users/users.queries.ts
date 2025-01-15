import { redirect } from 'next/navigation'
import { cache } from 'react'

import { findUserByField, getAuthUserDetails, getPublicUserDetails } from '@/lib/db/queries'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'

export type PostUser = {
  id: string
  username: string
  name: string
  avatar: string | null
  bio: string | null
  followerCount: number
  isFollowed: boolean
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
      return redirect('/login')
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
      },
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Failed to fetch user info' }
  }
})

export const getPublicUserInfo = getPublicUserInfoCached
