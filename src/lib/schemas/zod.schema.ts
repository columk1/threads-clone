import { z } from 'zod'

import { isUniqueUserField } from '@/app/actions'

const required_error = 'This field is required.'

export const SignupSchema = z.object({
  email: z
    .string({ required_error })
    .min(1, { message: 'Email is required' })
    .email({ message: 'Enter a valid email address' })
    .refine(async (val) => await isUniqueUserField('email', val), {
      message: 'Another account is using the same email.',
    }),
  password: z.string().min(6, { message: 'Create a password at least 6 characters long' }),
  name: z.string().min(1, { message: 'Name is required' }),
  username: z
    .string()
    .min(1, { message: 'Username is required' })
    .refine(async (val) => await isUniqueUserField('username', val), {
      message: 'A user with that username already exists.',
    }),
})

export const verifyEmailSchema = z.object({
  code: z.string({ required_error: 'Code is required' }).length(6, { message: 'Must be exactly 6-digits long' }),
})

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }),
  password: z.string({ required_error: 'Password is required' }),
})

export const newPostSchema = z
  .object({
    text: z.string().trim().optional(),
    image: z.string().url({ message: 'Invalid URL' }).optional(),
  })
  .refine((data) => data.text || data.image, {
    message: 'Either text or image is required',
    path: ['text'],
  })

export const replySchema = z
  .object({
    text: z.string().trim().optional(),
    image: z.string().url({ message: 'Invalid URL' }).optional(),
    parentId: z.string({ required_error: 'Parent ID is required' }),
  })
  .refine((data) => data.text || data.image, {
    message: 'Either text or image is required',
    path: ['text'],
  })

export const usernameParamSchema = z
  .string()
  .startsWith('%40', 'Username must start with @')
  .transform((s) => s.slice(3)) // Remove %40 prefix
