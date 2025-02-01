import path from 'node:path'

import { createClient } from '@libsql/client'
import { drizzle as drizzleLibSql } from 'drizzle-orm/libsql'
import { migrate as migrateLibSql } from 'drizzle-orm/libsql/migrator'

import { Env } from '../Env.ts'
import * as schema from './Schema.ts'

if (!Env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

if (!Env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not defined')
}

const client = createClient({
  url: Env.DATABASE_URL,
  authToken: Env.TURSO_AUTH_TOKEN,
})

const drizzle = drizzleLibSql(client, { schema })

await migrateLibSql(drizzle, {
  migrationsFolder: path.join(process.cwd(), 'migrations'),
})

export const db = drizzle
