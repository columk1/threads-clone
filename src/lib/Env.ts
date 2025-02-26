import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

// Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
export const Env = createEnv({
  server: {
    DATABASE_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    ETHEREAL_USER: z.string().optional(),
    ETHEREAL_PASS: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    TEST_USER_PASSWORD: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
    NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']).optional(),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    ETHEREAL_USER: process.env.ETHEREAL_USER,
    ETHEREAL_PASS: process.env.ETHEREAL_PASS,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
  },
})
