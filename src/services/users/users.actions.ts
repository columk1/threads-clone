'use server'

import { parseWithZod } from '@conform-to/zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { DEFAULT_ERROR, ROUTES } from '@/lib/constants'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'
import { bioSchema, type FollowActionType, followSchema } from '@/lib/schemas/zod.schema'
import { handleFollow, updateUserAvatar, updateUserBio } from '@/repositories/users.repository'

/*
 * Update Avatar
 */
export const updateAvatar = async (url: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
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
    return redirect(ROUTES.LOGIN)
  }

  try {
    followSchema.parse({ userId, action })
    await handleFollow(userId, user.id, action)
    return {
      success: action === 'follow' ? FollowStatus.Followed : FollowStatus.Unfollowed,
    }
  } catch (err) {
    logger.error(err, 'Error following/unfollowing user')
    return { error: DEFAULT_ERROR }
  }
}

/*
 * Update Bio
 */
export const updateBio = async (_: unknown, formData: FormData) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
  }

  const submission = parseWithZod(formData, {
    schema: bioSchema,
  })

  if (submission.status !== 'success') {
    logger.error(submission.error, 'Error updating bio')
    return { error: submission.error?.bio?.[0] || DEFAULT_ERROR }
  }

  try {
    await updateUserBio(user.id, submission.value.bio)
    revalidatePath('/', 'page')
    return { success: true }
  } catch (err) {
    logger.error(err, 'Error updating bio')
    return { error: DEFAULT_ERROR }
  }
}
