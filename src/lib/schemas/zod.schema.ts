import { z } from 'zod'

export type ImageData = {
  url: string
  width: string
  height: string
} | null

const MAX_FILE_SIZE = 10000000 // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
// import { isUniqueEmail, isUniqueUsername } from '@/services/users/users.client.queries'

export const verifyEmailSchema = z.object({
  code: z.string({ required_error: 'Code is required' }).length(6, { message: 'Must be exactly 6-digits long' }),
})

export const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }),
  password: z.string({ required_error: 'Password is required' }),
})

// Client-side file validation
export const imageSchema = z
  .custom<File>()
  .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is ${MAX_FILE_SIZE / 1000000}MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
    'Only .jpg, .jpeg, .png, and .webp formats are supported.',
  )

// Server-side URL validation
export const imageUrlSchema = z
  .string()
  .url()
  .refine((url) => {
    const extension = url.split('.').pop()?.toLowerCase()
    return extension ? ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(extension) : false
  }, 'Invalid image format. Only jpg, jpeg, png, webp and heic are supported.')

export const newPostSchema = z
  .object({
    text: z.string().trim().max(500, { message: 'Maximum 500 characters' }).optional(),
    image: imageUrlSchema.optional(),
    imageWidth: z.number().optional(),
    imageHeight: z.number().optional(),
  })
  .refine((data) => data.text || (data.image && data.imageWidth && data.imageHeight), {
    message: 'Either text or image is required',
    path: ['text'],
  })

export const replySchema = z
  .object({
    text: z.string().trim().max(500, { message: 'Maximum 500 characters' }).optional(),
    image: imageUrlSchema.optional(),
    imageWidth: z.number().optional(),
    imageHeight: z.number().optional(),
    parentId: z.string({ required_error: 'Parent ID is required' }),
  })
  .refine((data) => data.text || (data.image && data.imageWidth && data.imageHeight), {
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
