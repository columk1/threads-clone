import { eq } from 'drizzle-orm'

import { db } from './Drizzle'
import { emailVerificationCodeSchema, type User, userSchema } from './Schema'

export const insertEmailVerificationCode = async (userId: string, code: string, expiresAt: number) => {
  await db.delete(emailVerificationCodeSchema).where(eq(emailVerificationCodeSchema.userId, userId))

  await db.insert(emailVerificationCodeSchema).values({
    code,
    expiresAt,
    userId,
  })
}

type UserField = keyof User

export const getUserByField = async (field: UserField, value: string) => {
  const user = await db.select().from(userSchema).where(eq(userSchema[field], value))
  return user[0]
}

type NewUserParams = {
  id: string
  email: string
  emailVerified: number
  password: string
  name: string
  username: string
}

export const insertUser = async (user: NewUserParams) => {
  const newUser = await db.insert(userSchema).values(user).returning()
  return newUser[0]
}
