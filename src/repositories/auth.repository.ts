import { eq, or } from 'drizzle-orm'

import { db } from '../lib/db/Drizzle'
import { emailVerificationCodeSchema, userSchema } from '../lib/db/Schema'

export const getLatestVerificationCode = async (userId: string) => {
  const lastSent = await db.query.emailVerificationCodeSchema.findFirst({
    where: (Schema, { eq }) => eq(Schema.userId, userId),
    columns: { expiresAt: true },
  })
  return lastSent
}

export const createEmailVerificationCode = async (userId: string, code: string, expiresAt: Date) => {
  await db.delete(emailVerificationCodeSchema).where(eq(emailVerificationCodeSchema.userId, userId))

  return await db
    .insert(emailVerificationCodeSchema)
    .values({
      code,
      expiresAt,
      userId,
    })
    .returning()
    .get()
}

export const getEmailVerificationCode = async (code: string) => {
  return await db.select().from(emailVerificationCodeSchema).where(eq(emailVerificationCodeSchema.code, code)).get()
}

export const updateEmailVerified = async (userId: string) => {
  await db.update(userSchema).set({ emailVerified: 1 }).where(eq(userSchema.id, userId))
}

export const deleteEmailVerificationCode = async (id: string) => {
  await db.delete(emailVerificationCodeSchema).where(eq(emailVerificationCodeSchema.id, id))
}

export const getUserByEmail = async (email: string) => {
  return await db.select().from(userSchema).where(eq(userSchema.email, email)).get()
}

export const getUserByGoogleId = async (googleId: string) => {
  return await db.select().from(userSchema).where(eq(userSchema.googleId, googleId)).get()
}

// Retrieve a user by their email or username
export const getUserByIdentifier = async (identifier: string) => {
  return await db
    .select()
    .from(userSchema)
    .where(or(eq(userSchema.email, identifier), eq(userSchema.username, identifier)))
    .get()
}
