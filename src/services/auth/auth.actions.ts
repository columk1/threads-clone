'use server'

import { parseWithZod } from '@conform-to/zod'
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import { ulid } from 'ulidx'
import { z } from 'zod'

import { DEFAULT_ERROR, NOT_AUTHORIZED_ERROR, ROUTES } from '@/lib/constants'
import { sendVerificationEmail } from '@/lib/email'
import { createEmailVerificationCode, setEmailVerificationAlertCookie } from '@/lib/email-verification'
import { logger } from '@/lib/Logger'
import { loginSchema, verifyEmailSchema } from '@/lib/schemas/zod.schema'
import { signupSchema } from '@/lib/schemas/zod.schema.server'
import {
  createSessionAndSetCookie,
  deleteSessionTokenCookie,
  deleteVerifiedEmailAlertCookie,
  invalidateAllSessions,
  invalidateSession,
  validateRequest,
} from '@/lib/Session'
import {
  deleteEmailVerificationCode,
  getEmailVerificationCode,
  getLatestVerificationCode,
  getUserByEmail,
  updateEmailVerified,
} from '@/repositories/auth.repository'
import { createUser, getUserById } from '@/repositories/users.repository'
import { isWithinExpirationDate, timeFromNow } from '@/utils/dateUtils'

/*
 * Send Email Verification Code
 */
export async function sendEmailVerificationCode(userId: string, name: string, email: string) {
  try {
    const { code, expiresAt } = await createEmailVerificationCode(userId)
    await sendVerificationEmail({ name, email, code })
    await setEmailVerificationAlertCookie(expiresAt)
    logger.info(`Verification email sent to ${email}`)

    logger.info(`\n🤫 OTP for ${email} is ${code}\n`) // log OTP for local development
  } catch (err) {
    logger.error(err, `Failed to send verification email to ${email}`)
    throw new Error('Failed to send verification email')
  }
}

/**
 * Handles user signup process including:
 * - Creating new user account
 * - Sending verification email
 * - Creating session
 * - Setting cookies
 * @param _ - Unused parameter (required by form action)
 * @param formData - Form data containing signup information
 * @returns Redirect to email verification page on success or else back to the signup form with validation errors
 * @throws Error if user creation fails or if there are issues during signup process
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

  logger.info(user, 'User created successfully:')

  try {
    const firstName = name.split(' ')[0] || name
    await sendEmailVerificationCode(userId, firstName, email)
    await createSessionAndSetCookie(user.id)
    logger.info(`Session created successfully for user: ${userId}`)
  } catch (err) {
    logger.error(err, `Signup error for user ${userId}`)
    throw new Error(DEFAULT_ERROR)
  }

  return redirect(ROUTES.VERIFY_EMAIL)
}

/**
 * Verifies a user's email using a verification code
 * - Validates the code
 * - Updates user's email verification status
 * - Creates new session
 * @param _ - Unused parameter (required by form action)
 * @param formData - Form data containing verification code
 * @returns Redirect to home page or form validation errors
 * @throws Error if user is not found
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

  await invalidateAllSessions(user.id)
  await updateEmailVerified(user.id)

  logger.info(`\n😊 ${user.email} has been verified.\n`)

  await createSessionAndSetCookie(user.id)
  setEmailVerificationAlertCookie(new Date(Date.now() + 5 * 60 * 1000))

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
    return redirect(ROUTES.LOGIN)
  }

  const lastSent = await getLatestVerificationCode(user.id)

  if (lastSent && isWithinExpirationDate(new Date(lastSent.expiresAt))) {
    return {
      error: `Please wait ${timeFromNow(new Date(lastSent.expiresAt))} before resending`,
    }
  }

  const fullUser = await getUserById(user.id)
  const name = fullUser?.name || user.username
  await sendEmailVerificationCode(user.id, name, user.email)

  return { success: true }
}

/**
 * Handles user login process including:
 * - Validating credentials
 * - Creating session
 * - Setting cookies
 * @param _ - Unused parameter (required by form action)
 * @param formData - Form data containing login credentials
 * @returns Redirect to appropriate page or form validation errors
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

  await invalidateAllSessions(user.id)

  await createSessionAndSetCookie(user.id)

  if (!user.emailVerified) {
    await sendEmailVerificationCode(user.id, user.name, user.email)
    return redirect(ROUTES.VERIFY_EMAIL)
  }

  return redirect('/')
}

/**
 * Handles user logout process including:
 * - Invalidating current session
 * - Clearing cookies
 * - Cleaning up expired sessions
 * @returns Redirect to login page or error if not authorized
 */
export const logout = async () => {
  const { session } = await validateRequest()

  if (!session) {
    return { error: NOT_AUTHORIZED_ERROR }
  }

  await invalidateSession(session.id)
  await deleteSessionTokenCookie()
  await deleteVerifiedEmailAlertCookie()

  return redirect(ROUTES.LOGIN)
}
