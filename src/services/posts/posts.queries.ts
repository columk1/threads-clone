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

/*
 * Get Posts
 */
export const getPosts = async (username?: string) => {
  const { user } = await validateRequest()

  if (!user) {
    const posts = await listPublicPosts(username)
    // Replace 0 from Sqlite with actual boolean
    return posts.map((post) => ({
      ...post,
      user: {
        ...post.user,
        isFollowed: false,
      },
    }))
  }

  const posts = await listAuthPosts(user.id, username)

  // Replace 1/0s with booleans
  const formattedPosts = posts.map((post) => ({
    ...post,
    post: {
      ...post.post,
      isLiked: Boolean(post.isLiked), // Cast 1/0 to true/false
    },
    user: {
      ...post.user,
      isFollowed: Boolean(post.user.isFollowed),
    },
  }))

  return formattedPosts
}

/*
 * Get Following Posts
 */
export const getFollowingPosts = async () => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  const posts = await listFollowingPosts(user.id)

  // Replace 1/0s with booleans
  const formattedPosts = posts.map((post) => ({
    post: {
      ...post.post,
      isLiked: Boolean(post.isLiked),
    },
    user: {
      ...post.user,
      isFollowed: Boolean(post.user.isFollowed),
    },
  }))
  return formattedPosts
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

  return results.map((result) => ({
    ...result,
    post: {
      ...result.post,
      isLiked: Boolean(result.isLiked),
    },
    user: {
      ...result.user,
      isFollowed: Boolean(result.user.isFollowed),
    },
  }))
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
