// /*
//  * GET posts
//  */
// export const getAllPosts = async () => {
//   const getCachedPosts = unstable_cache(
//     async () => {
//       console.log('Fetching posts from database...')
//       const posts = await db.select({
//         post: postSchema,
//         user: {
//           username: userSchema.username,
//         },
//       })
//         .from(postSchema)
//         .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
//         .where(isNull(postSchema.parentId))
//         .all()
//       return posts
//     },
//     [], // add the user ID to the cache key
//     {
//       tags: ['posts'],
//       revalidate: 60,
//     },
//   )
//   return getCachedPosts()
// }