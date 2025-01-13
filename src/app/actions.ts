'use server'

import { parseWithZod } from '@conform-to/zod'
import bcrypt from 'bcrypt'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isWithinExpirationDate } from 'oslo'
import { cache } from 'react'
import { ulid } from 'ulidx'
import { z } from 'zod'

import { VERIFIED_EMAIL_ALERT } from '@/lib/constants'
import {
  createEmailVerificationCode,
  createUser,
  deleteEmailVerificationCode,
  deleteLikeAndUpdateCount,
  findUserByField,
  getAuthPostWithReplies,
  getAuthUserDetails,
  getEmailVerificationCode,
  getFollowStatus,
  getLatestVerificationCode,
  getPostById,
  getPublicPostWithReplies,
  getPublicUserDetails,
  getUserByEmail,
  getUserById,
  handleFollow,
  insertLikeAndUpdateCount,
  insertPost,
  listAuthPosts,
  listFollowingPosts,
  listPublicPosts,
  updateEmailVerified,
  updateUserAvatar,
} from '@/lib/db/queries'
import { logger } from '@/lib/Logger'
import { lucia, validateRequest } from '@/lib/Lucia'
import {
  type FollowActionType,
  followSchema,
  loginSchema,
  newPostSchema,
  replySchema,
  SignupSchema,
  verifyEmailSchema,
} from '@/lib/schemas/zod.schema'
import { generateRandomString } from '@/utils/string/generateRandomString'

/*
 * Generate Email Verification Code
 */
const generateEmailVerificationCode = async (userId: string): Promise<string> => {
  const code = generateRandomString(6)
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

  await createEmailVerificationCode(userId, code, expiresAt)

  return code
}

/*
 * Send Email Verification Code
 */
export async function sendEmailVerificationCode(userId: string, email: string) {
  const code = await generateEmailVerificationCode(userId)
  logger.info(`\n🤫 OTP for ${email} is ${code}\n`) // send an email to user with this OTP
}

/*
 * Is Unique Field
 */
export const isUniqueUserField = async (field: 'email' | 'username', value: string) => {
  const user = await findUserByField(field, value)
  return !user
}

/*
 * Sign Up
 */
export async function signup(_: unknown, formData: FormData) {
  // const {} = await signupLimiter.consume()

  const userId = ulid()
  const submission = await parseWithZod(formData, { schema: SignupSchema, async: true })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { email, password, name, username } = submission.value

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await createUser({ id: userId, emailVerified: 0, password: hashedPassword, email, name, username })

  if (!user) {
    throw new Error('Failed to create user')
  }

  logger.info('User created successfully:', user)

  try {
    sendEmailVerificationCode(userId, email)

    const cookieStore = await cookies()
    cookieStore.set(VERIFIED_EMAIL_ALERT, 'true', {
      maxAge: 60 * 1000, // 1 minute
    })

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookieStore.set(sessionCookie)
    logger.info(`Session created successfully for user: ${userId}`)
  } catch (err) {
    logger.error(`Signup error for user ${userId}:`, err)
    throw new Error('Something went wrong. Please try again.')
  }

  return redirect('/verify-email')
}

/*
 * Verify Email
 */
export async function verifyEmail(_: unknown, formData: FormData) {
  const submission = await parseWithZod(formData, {
    schema: verifyEmailSchema.transform(async (data, ctx) => {
      const { code } = data

      const databaseCode = await getEmailVerificationCode(code)

      if (!databaseCode) {
        ctx.addIssue({
          path: ['code'],
          code: z.ZodIssueCode.custom,
          message: "That code isn't valid. You can request a new one.",
        })
        return z.NEVER
      }

      if (databaseCode.expiresAt && !isWithinExpirationDate(new Date(databaseCode.expiresAt))) {
        ctx.addIssue({
          path: ['code'],
          code: z.ZodIssueCode.custom,
          message: 'Verification code expired',
        })
        return z.NEVER
      }

      await deleteEmailVerificationCode(databaseCode.id)

      return { ...data, ...databaseCode }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const user = await getUserById(submission.value.userId)

  if (!user) {
    throw new Error('User not found')
  }

  await lucia.invalidateUserSessions(user.id)
  await updateEmailVerified(user.id)

  logger.info(`\n😊 ${user.email} has been verified.\n`)

  const session = await lucia.createSession(user.id, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie)

  cookieStore.set(VERIFIED_EMAIL_ALERT, 'true', {
    maxAge: 10 * 60 * 1000, // 10 minutes
  })

  return redirect('/')
}

const timeFromNow = (time: Date) => {
  const now = new Date()
  const diff = time.getTime() - now.getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const seconds = Math.floor(diff / 1000) % 60
  return `${minutes}m ${seconds}s`
}

/*
 * Resend Verification Email
 */
export async function resendVerificationEmail(): Promise<{
  error?: string
  success?: boolean
}> {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  const lastSent = await getLatestVerificationCode(user.id)

  if (lastSent && isWithinExpirationDate(new Date(lastSent.expiresAt))) {
    return {
      error: `Please wait ${timeFromNow(new Date(lastSent.expiresAt))} before resending`,
    }
  }

  await sendEmailVerificationCode(user.id, user.email)

  return { success: true }
}

/*
 * Login
 */
export async function login(_: unknown, formData: FormData) {
  const submission = await parseWithZod(formData, {
    schema: loginSchema.transform(async (data, ctx) => {
      const user = await getUserByEmail(data.email)
      if (!(user && user.id)) {
        ctx.addIssue({
          path: ['password'],
          code: z.ZodIssueCode.custom,
          message: 'Incorrect password.',
        })
        return z.NEVER
      }

      const isPasswordValid = await bcrypt.compare(data.password, user.password)

      if (!isPasswordValid) {
        ctx.addIssue({
          path: ['password'],
          code: z.ZodIssueCode.custom,
          message: 'Incorrect password.',
        })
        return z.NEVER
      }

      return { ...data, ...user }
    }),
    async: true,
  })
  logger.info(submission) // { status, payload (form data), value (user object) }

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const user = submission.value

  await lucia.invalidateUserSessions(user.id)

  const session = await lucia.createSession(user.id, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie)

  if (!user.emailVerified) {
    await sendEmailVerificationCode(user.id, user.email)
    return redirect('/verify-email')
  }

  return redirect('/')
}

/*
 * Logout
 */
export const logout = async () => {
  const { session } = await validateRequest()

  if (!session) {
    return { error: 'Unauthorized' }
  }

  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()
  const cookieStore = await cookies()
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  await lucia.deleteExpiredSessions()

  cookieStore.delete(VERIFIED_EMAIL_ALERT)

  return redirect('/login')
}

export type PostUser = {
  username: string
  name: string
  avatar: string | null
  bio: string | null
  followerCount: number
  isFollowed: boolean
}

export type PublicUser = {
  username: string
  name: string
  avatar: string | null
  bio: string | null
  followerCount: number
}

/*
 * GET posts
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
 * GET following posts (Where the current user is following the user who made the post)
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
 * POST posts
 */
export const createPost = async (_: unknown, formData: FormData) => {
  // const userId = '01JBXMJGX3JABF1GQXSW38MXMN'
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  const userId = user.id
  const submission = parseWithZod(formData, {
    schema: newPostSchema,
  })
  if (submission.status !== 'success') {
    logger.info('error submitting new thread')
    // return submission.reply()
    return { error: 'Something went wrong. Please try again.' }
  }
  try {
    await insertPost(userId, submission.value)
    return { success: true }
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * Create Reply
 */
export async function createReply(_: unknown, formData: FormData) {
  const { user } = await validateRequest()
  if (!user) {
    redirect('/login')
  }

  const submission = parseWithZod(formData, {
    schema: replySchema,
  })

  if (submission.status !== 'success') {
    logger.info('error submitting reply')
    return { error: 'Something went wrong. Please try again.' }
  }

  try {
    const reply = await insertPost(user.id, submission.value)
    return { data: reply }
  } catch (error) {
    logger.error('Error creating reply:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * POST: Follow/Unfollow
 */

enum FollowStatus {
  Followed = 'Followed',
  Unfollowed = 'Unfollowed',
}

export const handleFollowAction = async (username: string, action: FollowActionType) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  try {
    followSchema.parse({ username, action })
    await handleFollow(username, user.id, action)
    return {
      success: action === 'follow' ? FollowStatus.Followed : FollowStatus.Unfollowed,
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * POST follow user
 */

// export const handleFollowAction = async (_: unknown, formData: FormData) => {
//   logger.info(formData)
//   const { user } = await validateRequest()
//   if (!user) {
//     return redirect('/login')
//   }
//   const submission = parseWithZod(formData, {
//     schema: followSchema,
//   })
//   if (submission.status !== 'success') {
//     logger.info('error submitting new thread')
//     // return submission.reply()
//     return { error: 'Something went wrong. Please try again.' }
//   }
//   try {
//     await createOrDeleteFollow(submission.value.username, user.id, submission.value.actionType)

//     return {
//       success: submission.value.actionType === 'follow' ? FollowStatus.Followed : FollowStatus.Unfollowed,
//     }
//   } catch (err) {
//     logger.error(err)
//     return { error: 'Something went wrong. Please try again.' }
//   }
// }

/*
 * GET user follow status
 * Used for getting follow status on hover in Thread, might not be needed depending on how state is managed.
 */
export const isFollowing = async (username: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  try {
    return await getFollowStatus(username, user.id)
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * GET user info
 */
const getAuthUserInfoCached = cache(async (username: string): Promise<{ user: PostUser } | { error: string }> => {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return redirect('/login')
    }
    const userInfo = await getAuthUserDetails(username, user.id)

    if (!userInfo) {
      return { error: 'User not found' }
    }

    return {
      user: {
        username: userInfo.username,
        name: userInfo.name,
        avatar: userInfo.avatar,
        bio: userInfo.bio,
        followerCount: userInfo.followerCount,
        isFollowed: Boolean(userInfo.isFollowed),
      },
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Failed to fetch user info' }
  }
})

export const getUserInfo = getAuthUserInfoCached

/*
 * GET public user info
 */

const getPublicUserInfoCached = cache(async (username: string): Promise<{ user: PublicUser } | { error: string }> => {
  try {
    const userInfo = await getPublicUserDetails(username)

    if (!userInfo) {
      return { error: 'User not found' }
    }
    return {
      user: {
        username: userInfo.username,
        name: userInfo.name,
        avatar: userInfo.avatar,
        bio: userInfo.bio,
        followerCount: userInfo.followerCount,
      },
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Failed to fetch user info' }
  }
})

export const getPublicUserInfo = getPublicUserInfoCached

/*
 * GET public post and replies by id including author info from user table
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
 * GET authenticated post and replies by id including author info from user table
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
 * // GET single post by id including author info from user table (no replies)
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
 * POST: Like/Unlike
 */

export type LikeAction = 'like' | 'unlike'

const likeQueries = {
  like: insertLikeAndUpdateCount,
  unlike: deleteLikeAndUpdateCount,
}

export const handleLikeAction = async (actionType: LikeAction, postId: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  const userId = user.id
  const likeQuery = likeQueries[actionType]
  try {
    await likeQuery(postId, userId)
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.', success: false }
  }
  return { success: true }
}

/*
 * Update Avatar
 */
export const updateAvatar = async (url: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  const userId = user.id
  try {
    // const arrayBuffer = await file.arrayBuffer()
    // const buffer = new Uint8Array(arrayBuffer)
    // const result = await new Promise((resolve, reject) => {
    //   cloudinary.uploader.upload_stream({
    //     folder: 'profile_images',
    //     public_id: userId,
    //     overwrite: true,
    //   }, (error, result) => {
    //     if (error) {
    //       return reject(error)
    //     }
    //     resolve(result)
    //   }).end(buffer)
    // })
    // console.log(result)

    await updateUserAvatar(userId, url)

    revalidatePath('/', 'page') // Refetch the user's posts, (profile is a dynamic segment on '/')

    return { success: true }
  } catch (err) {
    logger.error('Error uploading profile image:', err)
    return { success: false, error: 'Failed to upload image' }
  }
}

// export const getPostById = async (id: string) => {
//   const results = await db
//     .select({
//       post: postSchema,
//       user: {
//         username: userSchema.username,
//         name: userSchema.name,
//         bio: userSchema.bio,
//         followerCount: userSchema.followerCount,
//       },
//       isMainPost: sql`CASE WHEN ${postSchema.id} = ${id} THEN true ELSE false END`,
//     })
//     .from(postSchema)
//     .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
//     .where(
//       or(
//         eq(postSchema.id, id),
//         eq(postSchema.parentId, id),
//       ),
//     )
//     .orderBy(postSchema.createdAt)
//     .all()

//   if (!results.length) {
//     return null
//   }

//   const mainPost = results.find(r => r.isMainPost)
//   if (!mainPost) {
//     return null
//   }

//   return {
//     ...mainPost,
//     user: { ...mainPost.user, isFollowed: false },
//     replies: results
//       .filter(r => !r.isMainPost)
//       .map(reply => ({
//         post: reply.post,
//         user: { ...reply.user, isFollowed: false },
//       })),
//   }
// }
