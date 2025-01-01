'use server'

import { parseWithZod } from '@conform-to/zod'
import bcrypt from 'bcrypt'
import { and, eq, isNull, or, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isWithinExpirationDate } from 'oslo'
import { cache } from 'react'
import { ulid } from 'ulidx'
import { z } from 'zod'

import { VERIFIED_EMAIL_ALERT } from '@/libs/constants'
import { db } from '@/libs/DB'
import { logger } from '@/libs/Logger'
import { lucia, validateRequest } from '@/libs/Lucia'
import { emailVerificationCodeSchema, followerSchema, likeSchema, postSchema, userSchema } from '@/models/Schema'
import { loginSchema, newPostSchema, replySchema, SignupSchema, verifyEmailSchema } from '@/models/zod.schema'
import { generateRandomString } from '@/utils/generate-random-string'

/*
 * Generate Email Verification Code
 */
export const generateEmailVerificationCode = async (
  userId: string,
): Promise<string> => {
  await db
    .delete(emailVerificationCodeSchema)
    .where(eq(emailVerificationCodeSchema.userId, userId))

  const code = generateRandomString(6)

  await db.insert(emailVerificationCodeSchema).values({
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    userId,
  })

  return code
}

/*
 * Send Email Verification Code
 */
export async function sendEmailVerificationCode(userId: string, email: string) {
  const code = await generateEmailVerificationCode(userId)
  logger.info(`\n🤫 OTP for ${email} is ${code}\n`) // send an email to user with this OTP
}

// export const isEmailUnique = async (email: string) => {
//   const user = await db
//     .select()
//     .from(userSchema)
//     .where(eq(userSchema.email, email))
//     .all()
//   return !user.length
// }

/*
 * Is Unique Field
 */
export const isUniqueField = async (field: 'email' | 'username', value: string) => {
  const user = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema[field], value))
    .all()
  return !user.length
}

// const timeFromNow = (time: Date) => {
//   const now = new Date()
//   const diff = time.getTime() - now.getTime()
//   const minutes = Math.floor(diff / 1000 / 60)
//   const seconds = Math.floor(diff / 1000) % 60
//   return `${minutes}m ${seconds}s`
// }

/*
 * Sign Up
 */
export async function signup(_: unknown, formData: FormData) {
  // const {} = await signupLimiter.consume()

  const userId = ulid()
  const submission = SignupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!submission.success) {
    const errors = submission.error.flatten().fieldErrors
    logger.info(submission)

    // return redirect('signup')
    return { data: submission.data, error: {
      email: errors.email ? errors.email[0] : null,
      password: errors.password ? errors.password[0] : null,
      name: errors.name ? errors.name[0] : null,
      username: errors.username ? errors.username[0] : null,
      default: 'Something went wrong. Please try again.',
    } }
  }

  const { email, password, name, username } = submission.data

  const isValidEmail = await (isUniqueField('email', email))

  if (!isValidEmail) {
    return { data: submission.data, error: { email: 'Another account is using the same email.' } }
  }

  const isValidUsername = await (isUniqueField('username', username))

  if (!isValidUsername) {
    return { data: submission.data, error: { username: 'This username isn\'t available. Please try another.' } }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // await createUser(username, hashedPassword)
  const user = await db
    .insert(userSchema)
    .values({ id: userId, emailVerified: 0, password: hashedPassword, email, name, username })
    .returning()
    .then(s => s[0])

  if (!user) {
    throw new Error('Failed to create user')
  }

  logger.info(user)

  try {
    sendEmailVerificationCode(userId, submission.data.email)

    const cookieStore = await cookies()
    cookieStore.set(VERIFIED_EMAIL_ALERT, 'true', {
      maxAge: 60 * 1000, // 1 minute
    })

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookieStore.set(sessionCookie)
  } catch (err) {
    console.error(`Signup error while creating Lucia session:`)
    console.error(err)
  }

  // return { data: user, error: null }
  return redirect('/verify-email')
}

/*
 * Verify Email
 */
export async function verifyEmail(_: unknown, formData: FormData) { // first param is prevState
  const submission = await parseWithZod(formData, {
    schema: verifyEmailSchema.transform(async (data, ctx) => {
      const { code } = data

      const databaseCode = await db
        .select()
        .from(emailVerificationCodeSchema)
        .where(eq(emailVerificationCodeSchema.code, code))
        .execute()
        .then(s => s[0])

      if (!databaseCode) {
        ctx.addIssue({
          path: ['code'],
          code: z.ZodIssueCode.custom,
          message: 'Invalid OTP. Try again!',
        })
        return z.NEVER
      }

      if (
        databaseCode.expiresAt && !isWithinExpirationDate(new Date(databaseCode.expiresAt))
      ) {
        ctx.addIssue({
          path: ['code'],
          code: z.ZodIssueCode.custom,
          message: 'Verification code expired',
        })
        return z.NEVER
      }

      await db
        .delete(emailVerificationCodeSchema)
        .where(eq(emailVerificationCodeSchema.id, databaseCode.id))

      return { ...data, ...databaseCode }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const user = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.id, submission.value.userId))
    .execute()
    .then(s => s[0])

  if (!user) {
    throw new Error('User not found')
  }

  await lucia.invalidateUserSessions(user.id)
  await db
    .update(userSchema)
    .set({ emailVerified: 1 })
    .where(eq(userSchema.id, user.id))

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

  // const lastSent = await db.query.emailVerificationCodeSchema.findFirst({
  //   where: (Schema, { eq }) => eq(Schema.userId, user.id),
  //   columns: { expiresAt: true },
  // })

  // if (lastSent?.expiresAt && isWithinExpirationDate(new Date(lastSent.expiresAt))) {
  //   return {
  //     error: `Please wait ${timeFromNow(new Date(lastSent.expiresAt))} before resending`,
  //   }
  // }

  await sendEmailVerificationCode(user.id, user.email)

  return { success: true }
}

/*
 * Login
 */
export async function login(_: unknown, formData: FormData) { // first param is prevState
  const submission = await parseWithZod(formData, {
    schema: loginSchema.transform(async (data, ctx) => {
      const user = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, data.email))
        .execute()
        .then(s => s[0])
      if (!(user && user.id)) {
        ctx.addIssue({
          path: ['password'],
          code: z.ZodIssueCode.custom,
          message: 'Sorry, your password was incorrect. Please double-check your password.',
        })
        return z.NEVER
      }

      const isPasswordValid = await bcrypt.compare(data.password, user.password)

      if (!isPasswordValid) {
        ctx.addIssue({
          path: ['password'],
          code: z.ZodIssueCode.custom,
          message: 'Sorry, your password was incorrect. Please double-check your password.',
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
    return {
      error: 'Unauthorized',
    }
  }

  await lucia.invalidateSession(session.id)

  const sessionCookie = lucia.createBlankSessionCookie()
  const cookieStore = await cookies()
  cookieStore.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  )
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
export const getAllPosts = async (username?: string) => {
  const { user } = await validateRequest()

  if (!user) {
    const query = db
      .select({
        post: postSchema,
        user: {
          username: userSchema.username,
          name: userSchema.name,
          avatar: userSchema.avatar,
          bio: userSchema.bio,
          followerCount: userSchema.followerCount,
        },
      })
      .from(postSchema)
      .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
      .where(isNull(postSchema.parentId))
      .$dynamic()

    if (username) {
      query.where(eq(userSchema.username, username))
    }

    const posts = await query.all()

    const formattedPosts = posts.map(post => ({
      ...post,
      user: {
        ...post.user,
        isFollowed: false,
      },
    }))
    return formattedPosts
  }

  const query = db
    .select({
      post: postSchema,
      user: {
        username: userSchema.username,
        name: userSchema.name,
        avatar: userSchema.avatar,
        bio: userSchema.bio,
        followerCount: userSchema.followerCount,
        isFollowed: sql<boolean>`EXISTS (
        SELECT 1 
        FROM ${followerSchema} 
        WHERE ${followerSchema.userId} = ${userSchema.id} 
          AND ${followerSchema.followerId} = ${user.id}
      )`.as('isFollowed'),
      },
      isLiked: sql<boolean>`EXISTS (
        SELECT 1 
        FROM ${likeSchema} 
        WHERE ${likeSchema.userId} = ${user.id} 
          AND ${likeSchema.postId} = ${postSchema.id}
      )`.as('isLiked'),
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(isNull(postSchema.parentId))
    .$dynamic()

  if (username) {
    query.where(eq(userSchema.username, username))
  }

  const posts = await query.all()

  const formattedPosts = posts.map(post => ({
    ...post,
    post: {
      ...post.post,
      isLiked: !!post.isLiked,
    },
    user: {
      ...post.user,
      isFollowed: !!post.user.isFollowed, // Cast 1/0 to true/false
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
  const posts = await db.select({
    post: postSchema,
    user: {
      username: userSchema.username,
      name: userSchema.name,
      avatar: userSchema.avatar,
      bio: userSchema.bio,
      followerCount: userSchema.followerCount,
      isFollowed: sql<boolean>`EXISTS (
        SELECT 1 
        FROM ${followerSchema} 
        WHERE ${followerSchema.userId} = ${userSchema.id} 
          AND ${followerSchema.followerId} = ${user.id}
      )`.as('isFollowed'),
    },
    isLiked: sql<boolean>`EXISTS (
      SELECT 1 
      FROM ${likeSchema} 
      WHERE ${likeSchema.userId} = ${user.id} 
        AND ${likeSchema.postId} = ${postSchema.id}
    )`.as('isLiked'),
  })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .innerJoin(followerSchema, eq(postSchema.userId, followerSchema.userId))
    .where(and(isNull(postSchema.parentId), eq(followerSchema.followerId, user.id)))
    .all()
  const formattedPosts = posts.map(post => ({
    post: {
      ...post.post,
      isLiked: !!post.isLiked,
    },
    user: {
      ...post.user,
      isFollowed: !!post.user.isFollowed, // Cast 1/0 to true/false
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
  const submission = await parseWithZod(formData, {
    schema: newPostSchema,
  })
  if (submission.status !== 'success') {
    logger.info('error submitting new thread')
    // return submission.reply()
    return { error: 'Something went wrong. Please try again.' }
  }
  try {
    const newPost = await db.insert(postSchema).values({
      userId,
      ...submission.value,
    }).returning()
    return { data: newPost }
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
    const reply = await db.insert(postSchema).values({
      text: submission.value.text,
      userId: user.id,
      parentId: submission.value.parentId,
    }).returning()

    return { data: reply }
  } catch (error) {
    logger.error('Error creating reply:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * POST follow user
 */

enum FollowStatus {
  Followed = 'Followed',
  Unfollowed = 'Unfollowed',
}

export const followUser = async (_: unknown, formData: FormData) => {
  logger.info(formData)
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  const submission = await parseWithZod(formData, {
    schema: z.object({
      username: z.string().min(1),
      actionType: z.enum(['follow', 'unfollow']),
    }),
  })
  if (submission.status !== 'success') {
    logger.info('error submitting new thread')
    // return submission.reply()
    return { error: 'Something went wrong. Please try again.' }
  }
  try {
    const targetUser = await db
      .select({ id: userSchema.id, followerCount: userSchema.followerCount })
      .from(userSchema)
      .where(eq(userSchema.username, submission.value.username))
      .get()

    if (!targetUser) {
      throw new Error('User not found')
    }

    await db.transaction(async (tx) => {
      if (submission.value.actionType === 'follow') {
        await tx.insert(followerSchema).values({
          userId: targetUser.id,
          followerId: user.id,
        })
        // Update follower count
        await tx
          .update(userSchema)
          .set({ followerCount: targetUser.followerCount + 1 })
          .where(eq(userSchema.id, targetUser.id))
      } else { // unfollow branch
        await tx.delete(followerSchema).where(
          and(
            eq(followerSchema.userId, targetUser.id),
            eq(followerSchema.followerId, user.id),
          ),
        )
        // Update follower count
        await tx
          .update(userSchema)
          .set({ followerCount: targetUser.followerCount - 1 })
          .where(eq(userSchema.id, targetUser.id))
      }
    })
    return {
      success:
      submission.value.actionType === 'follow'
        ? FollowStatus.Followed
        : FollowStatus.Unfollowed,
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * POST: Follow/Unfollow
 */

export const toggleFollow = async (username: string, action: 'follow' | 'unfollow') => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }

  try {
    const targetUser = await db
      .select({ id: userSchema.id, followerCount: userSchema.followerCount })
      .from(userSchema)
      .where(eq(userSchema.username, username))
      .get()

    if (!targetUser) {
      throw new Error('User not found')
    }

    await db.transaction(async (tx) => {
      if (action === 'follow') {
        await tx.insert(followerSchema).values({
          userId: targetUser.id,
          followerId: user.id,
        })
        await tx
          .update(userSchema)
          .set({ followerCount: targetUser.followerCount + 1 })
          .where(eq(userSchema.id, targetUser.id))
      } else {
        const deletedFollow = await tx.delete(followerSchema).where(
          and(
            eq(followerSchema.userId, targetUser.id),
            eq(followerSchema.followerId, user.id),
          ),
        )
        if (deletedFollow.rowsAffected !== 1) {
          throw new Error('Failed to unfollow user')
        }
        await tx
          .update(userSchema)
          .set({ followerCount: targetUser.followerCount - 1 })
          .where(eq(userSchema.id, targetUser.id))
      }
    })
    return {
      success: action === 'follow' ? FollowStatus.Followed : FollowStatus.Unfollowed,
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * GET user follow status
 */
export const getUserFollowStatus = async (username: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  try {
    const result = await db
      .select({
        isFollowed: sql<boolean>`EXISTS (
      SELECT 1 
      FROM ${followerSchema} 
      WHERE ${followerSchema.userId} = (
        SELECT id FROM ${userSchema} WHERE username = ${username}
      )
      AND ${followerSchema.followerId} = ${user.id}
      LIMIT 1
    )`.as('isFollowed'),
      })
      .from(userSchema)
      .where(eq(userSchema.username, username))
      .get()

    return !!result?.isFollowed
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.' }
  }
}

/*
 * GET user info
 */
const getUserInfoCached = cache(async (username: string): Promise<
  | { user: PostUser }
  | { error: string }
> => {
  try {
    const { user } = await validateRequest()
    const userInfo = await db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        name: userSchema.name,
        avatar: userSchema.avatar,
        bio: userSchema.bio,
        followerCount: userSchema.followerCount,
        isFollowed: user
          ? sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${followerSchema} 
          WHERE ${followerSchema.userId} = ${userSchema.id}
          AND ${followerSchema.followerId} = ${user.id}
          LIMIT 1
        )`.as('isFollowed')
          : sql<boolean>`false`.as('isFollowed'),
      })
      .from(userSchema)
      .where(eq(userSchema.username, username))
      .get()

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
        isFollowed: !!userInfo.isFollowed,
      },
    }
  } catch (err) {
    logger.error(err)
    return { error: 'Failed to fetch user info' }
  }
})

export const getUserInfo = getUserInfoCached

/*
 * GET public user info
 */

const getPublicUserInfoCached = cache(async (username: string): Promise<
  | { user: PublicUser }
  | { error: string }
> => {
  try {
    const userInfo = await db
      .select({
        id: userSchema.id,
        username: userSchema.username,
        name: userSchema.name,
        avatar: userSchema.avatar,
        bio: userSchema.bio,
        followerCount: userSchema.followerCount,
      })
      .from(userSchema)
      .where(eq(userSchema.username, username))
      .get()

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
 * GET post and replies by id including author info from user table
 */

export const getPostById = async (id: string) => {
  const { user } = await validateRequest()

  // Base query that works for both authenticated and public users
  const baseSelect = {
    post: postSchema,
    user: {
      username: userSchema.username,
      name: userSchema.name,
      avatar: userSchema.avatar,
      bio: userSchema.bio,
      followerCount: userSchema.followerCount,
    },
  }

  if (!user) {
    const results = await db
      .select(baseSelect)
      .from(postSchema)
      .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
      .where(
        or(
          eq(postSchema.id, id),
          eq(postSchema.parentId, id),
        ),
      )
      .orderBy(postSchema.createdAt)
      .all()

    if (!results.length) {
      return null
    }

    return results.map(result => ({
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

  const results = await db
    .select({
      ...baseSelect,
      user: {
        ...baseSelect.user,
        isFollowed: sql<boolean>`EXISTS (
            SELECT 1 
            FROM ${followerSchema} 
            WHERE ${followerSchema.userId} = ${userSchema.id}
              AND ${followerSchema.followerId} = ${user.id}
          )`.as('isFollowed'),
      },
      isLiked: sql<boolean>`EXISTS (
          SELECT 1 
          FROM ${likeSchema} 
          WHERE ${likeSchema.userId} = ${user.id} 
            AND ${likeSchema.postId} = ${postSchema.id}
        )`.as('isLiked'),
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(
      or(
        eq(postSchema.id, id),
        eq(postSchema.parentId, id),
      ),
    )
    .orderBy(postSchema.createdAt)
    .all()

  if (!results.length) {
    return null
  }

  return results.map(result => ({
    ...result,
    post: {
      ...result.post,
      isLiked: !!result.isLiked,
    },
    user: {
      ...result.user,
      isFollowed: !!result.user.isFollowed,
    },
  }))
}

/*
 * // GET single post by id including author info from user table (no replies)
 */

export const getSinglePostById = async (id: string) => {
  const post = await db
    .select({
      post: postSchema,
      user: {
        username: userSchema.username,
        name: userSchema.name,
        avatar: userSchema.avatar,
        bio: userSchema.bio,
        followerCount: userSchema.followerCount,
      },
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(eq(postSchema.id, id))
    .get()

  if (!post) {
    return null
  }

  return {
    ...post,
    user: { ...post.user, isFollowed: false },
  }
}

/*
 * POST: Like
 */

export const likePost = async (postId: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  const userId = user.id

  try {
    await db.transaction(async (trx) => {
    // Add a like
      await trx.insert(likeSchema).values({ userId, postId })

      // Increment the like count
      await trx.update(postSchema)
        .set({ likeCount: sql`${postSchema.likeCount} + 1` })
        .where(eq(postSchema.id, postId))
    })
  } catch (err) {
    logger.error(err)
    return { error: 'Something went wrong. Please try again.', success: false }
  }
  return { success: true }
}

/*
 * POST: Unlike
 */

export const unlikePost = async (postId: string) => {
  const { user } = await validateRequest()
  if (!user) {
    return redirect('/login')
  }
  const userId = user.id

  try {
    await db.transaction(async (trx) => {
      // Remove a like
      await trx.delete(likeSchema).where(
        and(
          eq(likeSchema.userId, userId),
          eq(likeSchema.postId, postId),
        ),
      )

      // Decrement the like count
      await trx.update(postSchema)
        .set({ likeCount: sql`${postSchema.likeCount} - 1` })
        .where(eq(postSchema.id, postId))
    })
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

    await db
      .update(userSchema)
      .set({ avatar: url })
      .where(eq(userSchema.id, userId))

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
