'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { handleFollow, updateUserAvatar } from '@/lib/db/queries'
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
    logger.error(err, 'Error updating profile image')
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

export const handleFollowAction = async (userId: string, action: FollowActionType) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  try {
    followSchema.parse({ userId, action })
    await handleFollow(userId, user.id, action)
    return {
      success: action === 'follow' ? FollowStatus.Followed : FollowStatus.Unfollowed,
    }
  } catch (err) {
    logger.error(err, 'Error following/unfollowing user')
    return { error: 'Something went wrong. Please try again.' }
  }
}
