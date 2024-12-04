// export const getAllPosts = async () => {
//   'use cache'
//   cacheLife('hours')
//   cacheTag('posts')
//   const posts = await db.select({
//     post: postSchema,
//     user: {
//       username: userSchema.username,
//     },
//   })
//     .from(postSchema)
//     .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
//     .where(isNull(postSchema.parentId))
//     .all()
//   return posts
// }