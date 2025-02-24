import type { Like, Post, Repost } from '../Schema'

/**
 * Updates the counts (likes, reposts, replies) for a collection of posts based on their interactions
 * @param posts The posts to update counts for
 * @param likes The likes to process
 * @param reposts The reposts to process
 * @returns The updated posts array
 */
export function updatePostCounts(posts: Post[], likes: Like[], reposts: Repost[]): Post[] {
  // Create a map for faster lookups
  const postMap = new Map(posts.map((post) => [post.id, post]))

  // Update like counts
  likes.forEach((like) => {
    const post = postMap.get(like.postId)
    if (post) {
      post.likeCount++
    }
  })

  // Update repost counts
  reposts.forEach((repost) => {
    const post = postMap.get(repost.postId)
    if (post) {
      post.repostCount++
    }
  })

  // Update reply counts
  posts.forEach((post) => {
    if (post.parentId) {
      const parentPost = postMap.get(post.parentId)
      if (parentPost) {
        parentPost.replyCount++
      }
    }
  })

  return Array.from(postMap.values())
}
