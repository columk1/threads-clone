'use server'

import { parseWithZod } from '@conform-to/zod'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isWithinExpirationDate } from 'oslo'
import { ulid } from 'ulidx'
import { z } from 'zod'

import { VERIFIED_EMAIL_ALERT } from '@/libs/constants'
import { db } from '@/libs/DB'
import { logger } from '@/libs/Logger'
import { lucia, validateRequest } from '@/libs/Lucia'
import { emailVerificationCodeTable, userTable } from '@/models/Schema'
import { loginSchema, SignupSchema, verifyEmailSchema } from '@/models/zod.schema'
import { generateRandomString } from '@/utils/generate-random-string'

/*
 * Generate Email Verification Code
 */
export const generateEmailVerificationCode = async (
  userId: string,
): Promise<string> => {
  await db
    .delete(emailVerificationCodeTable)
    .where(eq(emailVerificationCodeTable.userId, userId))

  const code = generateRandomString(6)

  await db.insert(emailVerificationCodeTable).values({
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
//     .from(userTable)
//     .where(eq(userTable.email, email))
//     .all()
//   return !user.length
// }

/*
 * Is Unique Field
 */
export const isUniqueField = async (field: 'email' | 'username', value: string) => {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable[field], value))
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
    .insert(userTable)
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
        .from(emailVerificationCodeTable)
        .where(eq(emailVerificationCodeTable.code, code))
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
        .delete(emailVerificationCodeTable)
        .where(eq(emailVerificationCodeTable.id, databaseCode.id))

      return { ...data, ...databaseCode }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, submission.value.userId))
    .execute()
    .then(s => s[0])

  if (!user) {
    throw new Error('User not found')
  }

  await lucia.invalidateUserSessions(user.id)
  await db
    .update(userTable)
    .set({ emailVerified: 1 })
    .where(eq(userTable.id, user.id))

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

  // const lastSent = await db.query.emailVerificationCodeTable.findFirst({
  //   where: (table, { eq }) => eq(table.userId, user.id),
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
        .from(userTable)
        .where(eq(userTable.email, data.email))
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
