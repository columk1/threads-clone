import type { Config } from 'drizzle-kit'

export default {
  out: './migrations',
  schema: './src/models/Schema.ts',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
    authToken: process.env.TURSO_AUTH_TOKEN ?? '',
  },
  verbose: true,
  strict: true,
} satisfies Config
