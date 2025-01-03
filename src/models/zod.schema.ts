import { z } from 'zod'

export const SignupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  // email: z.string().min(1, 'Email is required').email('Invalid email').refine(validateEmail, { message: 'Email already exists' }),
  password: z.string().min(6, 'Create a password at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
})

export const verifyEmailSchema = z.object({
  code: z
    .string({ required_error: 'Code is required' })
    .length(6, { message: 'Must be exactly 6-digits long' }),
})

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' }),
  password: z.string({ required_error: 'Password is required' }),
})

export const newPostSchema = z.object({
  text: z.string().trim().optional(),
  image: z.string().url({ message: 'Invalid URL' }).optional(),
}).refine(data => data.text || data.image, {
  message: 'Either text or image is required',
  path: ['text'],
})

export const replySchema = z.object({
  text: z.string({ required_error: 'Text is required' }).trim().min(1, { message: 'Text is required' }),
  parentId: z.string({ required_error: 'Parent ID is required' }),
})

export const usernameParamSchema = z.string()
  .startsWith('%40', 'Username must start with @')
  .transform(s => s.slice(3)) // Remove %40 prefix
