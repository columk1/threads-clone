import { redirect } from 'next/navigation'

import {
  getAuthPostWithReplies,
  getPostById,
  getPublicPostWithReplies,
  listFollowingPosts,
  listPosts,
  listReplies,
  listReposts,
} from '@/lib/db/queries'
import { validateRequest } from '@/lib/Lucia'

export type RepliesResponse = Awaited<ReturnType<typeof listReplies>>
export type RepostsResponse = Awaited<ReturnType<typeof listReposts>>

/*
 * Helper to format posts data returned from query
 */

const formatPostsData = (data: Awaited<ReturnType<typeof listFollowingPosts>>) => {
  return data.map((item) => ({
    ...item,
    post: {
      ...item.post,
      isLiked: Boolean(item.post.isLiked), // Cast 1/0 to true/false
    },
    user: {
      ...item.user,
      isFollowed: Boolean(item.user.isFollowed),
    },
  }))
}

/*
 * Get Posts
 */
export const getPosts = async (username?: string) => {
  const { user } = await validateRequest()

  const data = await listPosts(username, user?.id)

  // Replace 1/0 from Sqlite with boolean
  return formatPostsData(data)
}

/*
 * Get Following Posts
 */
export const getFollowingPosts = async () => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  const data = await listFollowingPosts(user.id)

  return formatPostsData(data)
}

/*
 * Get a User's Threads
 */
export const getThreads = async (username: string) => {
  return username
}
/*
 * Get a User's Replies
 */

export const getReplies = async (username: string) => {
  const { user } = await validateRequest()

  const data = await listReplies(username, user?.id)
  return formatPostsData(data)
}

/*
 * Get a User's Reposts
 */
export const getReposts = async (username: string) => {
  const { user } = await validateRequest()

  const data = await listReposts(username, user?.id)
  return data.map((item) => ({
    ...item,
    post: {
      ...item.post,
      isLiked: Boolean(item.post.isLiked), // Cast 1/0 to true/false
      isReposted: Boolean(item.post.isReposted),
    },
    user: {
      ...item.user,
      isFollowed: Boolean(item.user.isFollowed),
    },
  }))
}

/*
 * Get Public Post By Id (with replies and author info from user table)
 */
export const getPublicPostById = async (id: string) => {
  const results = await getPublicPostWithReplies(id)

  if (!results.length) {
    return null
  }

  return results.map((result) => ({
    ...result,
    post: {
      ...result.post,
      isLiked: false,
    },
    user: {
      ...result.user,
      isFollowed: false,
    },
  }))
}

/*
 * Get Auth Post By Id (with replies and author info from user table)
 */
export const getAuthPostById = async (id: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  const results = await getAuthPostWithReplies(id, user.id)

  if (!results.length) {
    return null
  }

  return formatPostsData(results)
}

/*
 * Get Single Post By Id
 */
export const getSinglePostById = async (id: string) => {
  const post = await getPostById(id)

  if (!post) {
    return null
  }

  return {
    ...post,
    user: { ...post.user, isFollowed: false },
  }
}
