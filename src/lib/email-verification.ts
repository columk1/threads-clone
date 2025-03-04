import { cookies } from 'next/headers'

import {
  createEmailVerificationCode as createEmailVerificationCodeDb,
  deleteEmailVerificationCode,
} from '@/repositories/auth.repository'
import { generateRandomString } from '@/utils/string/generateRandomString'

import { EMAIL_VERIFICATION_MAX_AGE, VERIFIED_EMAIL_ALERT } from './constants'

export const createEmailVerificationCode = async (userId: string) => {
  await deleteEmailVerificationCode(userId)
  const code = generateRandomString(6)
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_MAX_AGE * 1000) // 5 minutes from now

  await createEmailVerificationCodeDb(userId, code, expiresAt)
  return { code, expiresAt }
}

export const setEmailVerificationAlertCookie = async (expires: Date) => {
  const cookieStore = await cookies()
  cookieStore.set(VERIFIED_EMAIL_ALERT, 'true', {
    expires,
  })
}
