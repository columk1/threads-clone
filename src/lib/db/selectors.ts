import { sql } from 'drizzle-orm'

import { followerSchema, likeSchema, postSchema, repostSchema, userSchema } from './Schema'

export const baseUserSelect = {
  id: userSchema.id,
  username: userSchema.username,
  name: userSchema.name,
  avatar: userSchema.avatar,
  bio: userSchema.bio,
  followerCount: userSchema.followerCount,
}

export const publicUserSelect = {
  ...baseUserSelect,
  isFollowed: sql<boolean>`false`,
  isFollower: sql<boolean>`false`,
}

export const authUserSelect = (userId: string) => ({
  ...baseUserSelect,
  isFollowed: sql<boolean>`EXISTS (
    SELECT 1 
    FROM ${followerSchema} 
    WHERE ${followerSchema.userId} = ${userSchema.id} 
      AND ${followerSchema.followerId} = ${userId}
  )`.as('isFollowed'),
  isFollower: sql<boolean>`EXISTS (
    SELECT 1 
    FROM ${followerSchema} 
    WHERE ${followerSchema.userId} = ${userId} 
      AND ${followerSchema.followerId} = ${userSchema.id}
  )`.as('isFollower'),
})

export const basePostSelect = {
  id: postSchema.id,
  text: postSchema.text,
  image: postSchema.image,
  imageWidth: postSchema.imageWidth,
  imageHeight: postSchema.imageHeight,
  userId: postSchema.userId,
  parentId: postSchema.parentId,
  likeCount: postSchema.likeCount,
  replyCount: postSchema.replyCount,
  repostCount: postSchema.repostCount,
  shareCount: postSchema.shareCount,
  createdAt: postSchema.createdAt,
}

export const publicPostSelect = {
  ...basePostSelect,
  isLiked: sql<boolean>`false`,
  isReposted: sql<boolean>`false`,
}

export const authPostSelect = (userId: string) => ({
  ...basePostSelect,
  isLiked: sql<boolean>`EXISTS (
    SELECT 1 
    FROM ${likeSchema} 
    WHERE ${likeSchema.userId} = ${userId} 
      AND ${likeSchema.postId} = ${postSchema.id}
  )`.as('isLiked'),
  isReposted: sql<boolean>`EXISTS (
    SELECT 1 
    FROM ${repostSchema} 
    WHERE ${repostSchema.userId} = ${userId} 
      AND ${repostSchema.postId} = ${postSchema.id}
  )`.as('isReposted'),
})

export const getAliasedBasePostSelect = (table: typeof postSchema) => ({
  id: table.id,
  text: table.text,
  image: table.image,
  imageWidth: table.imageWidth,
  imageHeight: table.imageHeight,
  userId: table.userId,
  parentId: table.parentId,
  likeCount: table.likeCount,
  replyCount: table.replyCount,
  repostCount: table.repostCount,
  shareCount: table.shareCount,
  createdAt: table.createdAt,
})

// Helper function to generate auth selectors for an aliased post table
export const getAuthAliasedPostSelect = (table: typeof postSchema, userId: string) => ({
  ...getAliasedBasePostSelect(table),
  isLiked: sql<boolean>`EXISTS (
    SELECT 1 
    FROM ${likeSchema} 
    WHERE ${likeSchema.postId} = ${table.id} 
      AND ${likeSchema.userId} = ${userId}
  )`.as('isLiked'),
  isReposted: sql<boolean>`EXISTS (
    SELECT 1 
    FROM ${repostSchema} 
    WHERE ${repostSchema.postId} = ${table.id} 
      AND ${repostSchema.userId} = ${userId}
  )`.as('isReposted'),
})
