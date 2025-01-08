import type { Config } from 'drizzle-kit'

import { Env } from '@/lib/Env'

export default {
  out: './src/lib/db/migrations',
  schema: './src/lib/db/Schema.ts',
  dialect: 'turso',
  dbCredentials: {
    url: Env.DATABASE_URL ?? '',
    authToken: Env.TURSO_AUTH_TOKEN ?? '',
  },
  verbose: true,
  strict: true,
} satisfies Config
