import { z } from 'zod'

// import { isUniqueEmail, isUniqueUsername } from '@/services/users/users.client.queries'

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

export const followSchema = z.object({
  userId: z.string().min(1, { message: 'UserId is required' }),
  action: z.enum(['follow', 'unfollow'], { message: 'Invalid action' }),
})

export type FollowActionType = z.infer<typeof followSchema>['action']
