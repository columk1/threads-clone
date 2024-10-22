'use server'

// import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { ulid } from 'ulidx'

import { db } from '@/libs/DB'
import { logger } from '@/libs/Logger'
import { userTable } from '@/models/Schema'
// import { VERIFIED_EMAIL_ALERT } from '@/app/lib/constants'
import { SignupSchema } from '@/models/zod.schema'

// export async function sendEmailVerificationCode(userId: string, email: string) {
//   const code = await generateEmailVerificationCode(userId)
//   logger.info(`\n🤫 OTP for ${email} is ${code}\n`) // send an email to user with this OTP
// }

// export const isEmailUnique = async (email: string) => {
//   const user = await db
//     .select()
//     .from(userTable)
//     .where(eq(userTable.email, email))
//     .all()
//   return !user.length
// }

export const isUniqueField = async (field: 'email' | 'username', value: string) => {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable[field], value))
    .all()
  return !user.length
}

export async function signup(_: unknown, formData: FormData) {
  // const {} = await signupLimiter.consume()

  const userId = ulid()
  const submission = SignupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!submission.success) {
    const errors = submission.error.flatten().fieldErrors
    logger.info(submission)

    // return redirect('sign-up')
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

  logger.info(user)

  // try {
  //   sendEmailVerificationCode(userId, submission.value.email)

  //   const cookieStore = await cookies()
  //   cookieStore.set(VERIFIED_EMAIL_ALERT, 'true', {
  //     maxAge: 60 * 1000, // 1 minute
  //   })
  // } catch (err) {
  //   console.error(`Signup error while creating Lucia session:`)
  //   console.error(err)
  // }

  // return { data: user, error: null }
  return redirect('/verify-email')
}
