import { sha256 } from '@oslojs/crypto/sha2'
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { cache } from 'react'

import { type Session, sessionSchema, type User, userSchema } from '@/lib/db/Schema'

import { VERIFIED_EMAIL_ALERT } from './constants'
import { db } from './db/Drizzle'
import { logger } from './Logger'

const IS_PROD = process.env.NODE_ENV === 'production'
const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30 // 30 days

export const setSessionTokenCookie = async (token: string, expiresAt: Date): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    expires: expiresAt,
    path: '/',
  })
}

export const deleteSessionTokenCookie = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set('session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: 0,
    path: '/',
  })
}

export const deleteVerifiedEmailAlertCookie = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete(VERIFIED_EMAIL_ALERT)
}

export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_DURATION),
  }
  await db.insert(sessionSchema).values(session)
  return session
}

export async function createSessionAndSetCookie(userId: string): Promise<{ session: Session; token: string }> {
  const token = generateSessionToken()
  const session = await createSession(token, userId)
  await setSessionTokenCookie(token, session.expiresAt)
  return { session, token }
}

const validateSessionToken = async (token: string): Promise<SessionValidationResult> => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const result = await db
    .select({
      user: {
        id: userSchema.id,
        email: userSchema.email,
        emailVerified: userSchema.emailVerified,
        username: userSchema.username,
        avatar: userSchema.avatar,
      },
      session: sessionSchema,
    })
    .from(sessionSchema)
    .innerJoin(userSchema, eq(sessionSchema.userId, userSchema.id))
    .where(eq(sessionSchema.id, sessionId))
    .get()
  if (!result) {
    return { session: null, user: null }
  }
  const { user, session } = result
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionSchema).where(eq(sessionSchema.id, sessionId))
    return { session: null, user: null }
  }
  // Extend the session if it's close to expiration
  if (Date.now() >= session.expiresAt.getTime() - SESSION_DURATION / 2) {
    session.expiresAt = new Date(Date.now() + SESSION_DURATION)
    await db.update(sessionSchema).set({ expiresAt: session.expiresAt }).where(eq(sessionSchema.id, sessionId))
  }
  return { session, user }
}

export const validateRequest = cache(async (): Promise<SessionValidationResult> => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value ?? null
    if (token === null) {
      return { session: null, user: null }
    }
    const result = await validateSessionToken(token)
    return result
  } catch (err) {
    logger.error(err, 'Error validating session token')
    return { session: null, user: null }
  }
})

export const invalidateSession = async (sessionId: string): Promise<void> => {
  await db.delete(sessionSchema).where(eq(sessionSchema.id, sessionId))
}

export const invalidateAllSessions = async (userId: string): Promise<void> => {
  await db.delete(sessionSchema).where(eq(sessionSchema.userId, userId))
}

export type SessionUser = Pick<User, 'id' | 'email' | 'emailVerified' | 'username' | 'avatar'>
export type SessionValidationResult = { session: Session; user: SessionUser } | { session: null; user: null }
