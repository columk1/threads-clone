import { z } from 'zod'

export const SignupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  // email: z.string().min(1, 'Email is required').email('Invalid email').refine(validateEmail, { message: 'Email already exists' }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
})
