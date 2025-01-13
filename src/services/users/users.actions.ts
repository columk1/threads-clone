'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getFollowStatus, handleFollow, updateUserAvatar } from '@/lib/db/queries'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'
import { type FollowActionType, followSchema } from '@/lib/schemas/zod.schema'

/*
 * Update Avatar
 */
export const updateAvatar = async (url: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  const userId = user.id
  try {
    await updateUserAvatar(userId, url)
    revalidatePath('/', 'page')
    return { success: true }
  } catch (err) {
    logger.error('Error uploading profile image:', err)
    return { success: false, error: 'Failed to upload image' }
  }
}

/*
 * Follow/Unfollow Action
 */

enum FollowStatus {
  Followed = 'Followed',
  Unfollowed = 'Unfollowed',
}

export const handleFollowAction = async (username: string, action: FollowActionType) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  try {
    followSchema.parse({ username, action })
    await handleFollow(username, user.id, action)
    return {
      success: action === 'follow' ? FollowStatus.Followed : FollowStatus.Unfollowed,
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * Get user follow status
 */
export const isFollowing = async (username: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  try {
    return await getFollowStatus(username, user.id)
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}
