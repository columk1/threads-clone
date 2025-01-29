import { redirect } from 'next/navigation'

import { ROUTES } from '@/lib/constants'
import { validateRequest } from '@/lib/Lucia'
import {
  getAuthPostWithReplies,
  getPostById,
  getPublicPostWithReplies,
  listFollowingPosts,
  listPosts,
  listReplies,
  listReposts,
  searchPosts as searchPostsQuery,
} from '@/repositories/posts.repository'

export type RepliesResponse = Awaited<ReturnType<typeof listReplies>>
export type RepostsResponse = Awaited<ReturnType<typeof listReposts>>

export const QUERY_LIMIT = 8

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
export const getPosts = async (username?: string, offset: number = 0) => {
  const { user } = await validateRequest()

  const data = await listPosts(username, user?.id, offset, QUERY_LIMIT)

  // Replace 1/0 from Sqlite with boolean
  return {
    posts: formatPostsData(data),
    nextOffset: data.length >= QUERY_LIMIT ? offset + QUERY_LIMIT : null,
  }
}

/*
 * Get Following Posts
 */
export const getFollowingPosts = async (offset: number = 0) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
  }

  const data = await listFollowingPosts(user.id, offset, QUERY_LIMIT)

  return {
    posts: formatPostsData(data),
    nextOffset: data.length >= QUERY_LIMIT ? offset + QUERY_LIMIT : null,
  }
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
    return redirect(ROUTES.LOGIN)
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

/*
 * Search Posts
 */
export const searchPosts = async (searchTerm: string, offset: number = 0) => {
  const { user } = await validateRequest()
  const data = await searchPostsQuery(searchTerm, user?.id, QUERY_LIMIT)

  // Replace 1/0 from Sqlite with boolean
  return {
    posts: formatPostsData(data),
    nextOffset: data.length >= QUERY_LIMIT ? offset + QUERY_LIMIT : null,
  }
}
