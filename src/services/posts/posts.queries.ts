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
export type PostsResponse = Awaited<ReturnType<typeof listFollowingPosts>>

export const QUERY_LIMIT = 8

type Post = PostsResponse[number]['post']
type User = PostsResponse[number]['user']
type PostWithUser = PostsResponse[number]

/*
 * Formats an object's boolean fields from numeric (0/1) to actual booleans
 */
const formatBooleans = <T extends Record<string, any>>(obj: T, fields: Array<keyof T>) =>
  ({
    ...obj,
    ...Object.fromEntries(fields.map((field) => [field, Boolean(obj[field])])),
  }) as T

/*
 * Helper to format posts data returned from query
 */
const formatPostsData = (data: PostWithUser[]): PostWithUser[] => {
  return data.map((item) => ({
    ...item,
    post: formatBooleans<Post>(item.post, ['isLiked', 'isReposted']),
    user: formatBooleans<User>(item.user, ['isFollowed']),
  }))
}

/*
 * Get Posts
 */
export const getPosts = async (username?: string, offset: number = 0) => {
  const { user } = await validateRequest()
  const data = await listPosts(username, user?.id, offset, QUERY_LIMIT)
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
    post: formatBooleans<Post>(item.post, ['isLiked', 'isReposted']),
    user: formatBooleans<User>(item.user, ['isFollowed']),
    repost: item.repost,
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
    post: formatBooleans<Post>(result.post, ['isLiked']),
    user: formatBooleans<User>(result.user, ['isFollowed']),
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
  return {
    posts: formatPostsData(data),
    nextOffset: data.length >= QUERY_LIMIT ? offset + QUERY_LIMIT : null,
  }
}
