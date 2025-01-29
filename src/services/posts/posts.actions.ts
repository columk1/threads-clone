'use server'

import { parseWithZod } from '@conform-to/zod'
import { redirect } from 'next/navigation'

import { DEFAULT_ERROR, ROUTES } from '@/lib/constants'
import {
  deleteLike,
  deletePost,
  deleteRepost,
  incrementShareCount,
  insertLike,
  insertPost,
  insertRepost,
} from '@/lib/db/queries'
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
    return { error: submission.error?.text || DEFAULT_ERROR }
  }
  try {
    await insertPost(userId, submission.value)
    return { success: true }
  } catch (err) {
    logger.error(err, 'Error creating new thread')
    return { error: DEFAULT_ERROR }
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
    return { error: submission.error?.text || DEFAULT_ERROR }
  }

  try {
    const reply = await insertPost(user.id, submission.value)
    return { data: reply }
  } catch (error) {
    logger.error(error, 'Error creating reply')
    return { error: DEFAULT_ERROR }
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
    return { error: DEFAULT_ERROR, success: false }
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
    return { error: DEFAULT_ERROR, success: false }
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
    return { error: DEFAULT_ERROR, success: false }
  }
  return { success: true }
}

/*
 * Delete Post
 */
export const handleDeleteAction = async (postId: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
  }
  try {
    if (typeof postId !== 'string') {
      throw new TypeError('Invalid post ID')
    }
    await deletePost(postId)
    return { success: true }
  } catch (err) {
    logger.error(err, 'Error deleting post')
    return { error: DEFAULT_ERROR, success: false }
  }
}
