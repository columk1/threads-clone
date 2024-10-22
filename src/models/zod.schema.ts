import { z } from 'zod'

export const SignupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  // email: z.string().min(1, 'Email is required').email('Invalid email').refine(validateEmail, { message: 'Email already exists' }),
  password: z.string().min(6, 'Create a password at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
})
