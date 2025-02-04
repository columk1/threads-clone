import { postSchema, userSchema } from './Schema'

export const baseUserSelect = {
  id: userSchema.id,
  username: userSchema.username,
  name: userSchema.name,
  avatar: userSchema.avatar,
  bio: userSchema.bio,
  followerCount: userSchema.followerCount,
}

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
