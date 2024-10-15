import { sql } from 'drizzle-orm'
import { integer, sqliteTable } from 'drizzle-orm/sqlite-core'

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

export const counterSchema = sqliteTable('counter', {
  id: integer('id').primaryKey(),
  count: integer('count').default(0),
  createdAt: integer('created_at').default(sql`(cast(unixepoch() as int))`),
  updatedAt: integer('updated_at').default(sql`(cast(unixepoch() as int))`),
})
