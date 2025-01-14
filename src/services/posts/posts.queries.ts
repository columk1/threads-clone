import { redirect } from 'next/navigation'

import {
  getAuthPostWithReplies,
  getPostById,
  getPublicPostWithReplies,
  listAuthPosts,
  listFollowingPosts,
  listPublicPosts,
} from '@/lib/db/queries'
import { validateRequest } from '@/lib/Lucia'

export type AuthPostsResponse = Awaited<ReturnType<typeof listAuthPosts>>
export type PublicPostsResponse = Awaited<ReturnType<typeof listPublicPosts>>

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
export const getPosts = async (username?: string): Promise<AuthPostsResponse | PublicPostsResponse> => {
  const { user } = await validateRequest()

  if (!user) {
    const posts = await listPublicPosts(username)
    // Replace 1/0 from Sqlite with boolean
    return posts.map((post) => ({
      ...post,
      user: {
        ...post.user,
        isFollowed: false,
      },
    }))
  }

  const data = await listAuthPosts(user.id, username)

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
