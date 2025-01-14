'use server'

import { parseWithZod } from '@conform-to/zod'
import { redirect } from 'next/navigation'

import { deleteLike, deleteRepost, insertLike, insertPost, insertRepost } from '@/lib/db/queries'
import { logger } from '@/lib/Logger'
import { validateRequest } from '@/lib/Lucia'
import { newPostSchema, replySchema } from '@/lib/schemas/zod.schema'

/*
 * Create Post
 */
export const createPost = async (_: unknown, formData: FormData) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  const userId = user.id
  const submission = parseWithZod(formData, {
    schema: newPostSchema,
  })
  if (submission.status !== 'success') {
    logger.info('error submitting new thread')
    return { error: 'Something went wrong. Please try again.' }
  }
  try {
    await insertPost(userId, submission.value)
    return { success: true }
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * Create Reply
 */
export async function createReply(_: unknown, formData: FormData) {
  const { user } = await validateRequest()
  if (!user) {
    redirect('/login')
  }

  const submission = parseWithZod(formData, {
    schema: replySchema,
  })

  if (submission.status !== 'success') {
    logger.info('error submitting reply')
    return { error: 'Something went wrong. Please try again.' }
  }

  try {
    const reply = await insertPost(user.id, submission.value)
    return { data: reply }
  } catch (error) {
    logger.error('Error creating reply:', error)
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
    return redirect('/login')
  }

  const userId = user.id
  const likeQuery = likeQueries[actionType]
  try {
    await likeQuery(postId, userId)
  } catch (err) {
    logger.error(err)
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
    return redirect('/login')
  }

  const userId = user.id
  const repostQuery = repostQueries[actionType]
  try {
    await repostQuery(postId, userId)
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.', success: false }
  }
  return { success: true }
}
