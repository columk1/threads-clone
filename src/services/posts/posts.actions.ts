'use server'

import { parseWithZod } from '@conform-to/zod'
import { redirect } from 'next/navigation'

import { ROUTES } from '@/lib/constants'
import { deleteLike, deleteRepost, incrementShareCount, insertLike, insertPost, insertRepost } from '@/lib/db/queries'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'
import { newPostSchema, replySchema } from '@/lib/schemas/zod.schema'

/*
 * Create Post
 */
export const createPost = async (_: unknown, formData: FormData) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
  }
  const userId = user.id
  const submission = parseWithZod(formData, {
    schema: newPostSchema,
  })
  if (submission.status !== 'success') {
    logger.error(submission.error, 'Error submitting new thread')
    return { error: submission.error?.text || 'Something went wrong. Please try again.' }
  }
  try {
    await insertPost(userId, submission.value)
    return { success: true }
  } catch (err) {
    logger.error(err, 'Error creating new thread')
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * Create Reply
 */
export async function createReply(_: unknown, formData: FormData) {
  const { user } = await validateRequest()
  if (!user) {
    redirect(ROUTES.LOGIN)
  }

  const submission = parseWithZod(formData, {
    schema: replySchema,
  })

  if (submission.status !== 'success') {
    logger.error(submission.error, 'Error submitting reply')
    return { error: submission.error?.text || 'Something went wrong. Please try again.' }
  }

  try {
    const reply = await insertPost(user.id, submission.value)
    return { data: reply }
  } catch (error) {
    logger.error(error, 'Error creating reply')
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * Like/Unlike
 */
export type LikeAction = 'like' | 'unlike'

const likeQueries = {
  like: insertLike,
  unlike: deleteLike,
}

export const handleLikeAction = async (actionType: LikeAction, postId: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
  }

  const userId = user.id
  const likeQuery = likeQueries[actionType]
  try {
    await likeQuery(postId, userId)
  } catch (err) {
    logger.error(err, 'Error toggling like')
    return { error: 'Something went wrong. Please try again.', success: false }
  }
  return { success: true }
}

/*
 * Repost/Unrepost
 */
export type RepostAction = 'repost' | 'unrepost'

const repostQueries = {
  repost: insertRepost,
  unrepost: deleteRepost,
}

export const handleRepostAction = async (actionType: RepostAction, postId: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
  }

  const userId = user.id
  const repostQuery = repostQueries[actionType]
  try {
    await repostQuery(postId, userId)
  } catch (err) {
    logger.error(err, 'Error toggling repost')
    return { error: 'Something went wrong. Please try again.', success: false }
  }
  return { success: true }
}

/*
 * Share
 */
export const handleShareAction = async (postId: string) => {
  try {
    await incrementShareCount(postId)
  } catch (err) {
    logger.error(err, 'Error incrementing share count')
    return { error: 'Something went wrong. Please try again.', success: false }
  }
  return { success: true }
}
