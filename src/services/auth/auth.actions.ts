'use server'

import { parseWithZod } from '@conform-to/zod'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isWithinExpirationDate } from 'oslo'
import { ulid } from 'ulidx'
import { z } from 'zod'

import { VERIFIED_EMAIL_ALERT } from '@/lib/constants'
import {
  createEmailVerificationCode,
  createUser,
  deleteEmailVerificationCode,
  getEmailVerificationCode,
  getLatestVerificationCode,
  getUserByEmail,
  getUserById,
  updateEmailVerified,
} from '@/lib/db/queries'
import { logger } from '@/lib/Logger'
import { lucia, validateRequest } from '@/lib/Lucia'
import { loginSchema, verifyEmailSchema } from '@/lib/schemas/zod.schema'
import { signupSchema } from '@/lib/schemas/zod.schema.server'
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
 * Sign Up
 */
export async function signup(_: unknown, formData: FormData) {
  const userId = ulid()
  const submission = await parseWithZod(formData, { schema: signupSchema, async: true })

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
  logger.info(submission)

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
