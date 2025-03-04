'use server'

import { parseWithZod } from '@conform-to/zod'
import { redirect } from 'next/navigation'
import { after } from 'next/server'

import { DEFAULT_ERROR, ROUTES } from '@/lib/constants'
import { reportedPostStatusEnum } from '@/lib/db/Schema'
import { logger } from '@/lib/Logger'
import { moderateContent } from '@/lib/OpenAi'
import { newPostSchema, replySchema } from '@/lib/schemas/zod.schema'
import { validateRequest } from '@/lib/Session'
import {
  deleteLike,
  deletePost,
  deleteRepost,
  getPost,
  incrementShareCount,
  insertLike,
  insertPost,
  insertRepost,
  reportPost,
  updateReportedPostStatus,
} from '@/repositories/posts.repository'

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
    const newPost = await insertPost(userId, submission.value)
    return { success: true, data: { postId: newPost.id } }
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
    // revalidatePath(`/@${user.username}/posts/${reply.parentId}`, 'page') // purges the router cache, will work more granularly in a later next version
    return { data: reply, success: true }
  } catch (error) {
    logger.error(error, 'Error creating reply')
    return { error: DEFAULT_ERROR, success: false }
  }
}

/*
 * Like/Unlike Post
 */
export type LikeAction = 'like' | 'unlike'

const likeQueries = {
  like: insertLike,
  unlike: deleteLike,
}

/*
 * Handle Like/Unlike Post
 */
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
 * Repost/Unrepost Post
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
    // revalidatePath(`/@${user.username}/reposts`, 'page')
  } catch (err) {
    logger.error(err, 'Error toggling repost')
    return { error: DEFAULT_ERROR, success: false }
  }
  return { success: true }
}

/*
 * Share Post
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
    // revalidatePath(`/@${user.username}`, 'page')
    return { success: true }
  } catch (err) {
    logger.error(err, 'Error deleting post')
    return { error: DEFAULT_ERROR, success: false }
  }
}

/**
 * Reports a post for moderation and triggers content moderation check
 * - Reports post for review
 * - Runs async moderation check using OpenAI
 * - Deletes post if flagged or marks as reviewed if safe
 * @param postId - The ID of the post to moderate
 * @returns Object indicating success or error
 * @throws Redirects to login if user is not authenticated
 * @throws Error if post is not found
 */
export const moderatePost = async (postId: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
  }
  try {
    const post = await getPost(postId)
    if (!post) {
      throw new Error('Post not found')
    }
    await reportPost(user.id, postId, post.userId)

    after(async () => {
      try {
        logger.info(`Text: ${!!post.text}, Image: ${!!post.image}`)
        const moderation = await moderateContent(post.text, post.image)
        logger.info(moderation)

        if (moderation.results.some((result) => result.flagged)) {
          logger.info(post, 'Post flagged')
          await deletePost(postId)
          logger.info('Post deleted')
        } else {
          await updateReportedPostStatus(user.id, postId, reportedPostStatusEnum.REVIEWED)
        }
      } catch (error) {
        logger.error(error, 'Error in moderation after hook')
      }
    })
    return { success: true }
  } catch (err) {
    logger.error(err, 'Error moderating post')
    return { error: DEFAULT_ERROR, success: false }
  }
}
