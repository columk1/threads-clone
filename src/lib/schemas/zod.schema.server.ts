import { z } from 'zod'

// This module doesn't work on the client so this schema is kept separate for server-side use only
import { isUniqueUserField } from '@/services/users/users.queries'

const required_error = 'This field is required.'

export const signupSchema = z.object({
  email: z
    .string({ required_error })
    .min(1, { message: 'Email is required' })
    .email({ message: 'Enter a valid email address' })
    .transform((val) => val.toLowerCase())
    .refine(async (val) => await isUniqueUserField('email', val), {
      message: 'Another account is using the same email.',
    }),
  password: z.string().min(6, { message: 'Create a password at least 6 characters long' }),
  name: z.string().min(1, { message: 'Name is required' }),
  username: z
    .string()
    .min(1, { message: 'Username is required' })
    .transform((val) => val.toLowerCase())
    .refine(async (val) => await isUniqueUserField('username', val), {
      message: 'A user with that username already exists.',
    }),
})
