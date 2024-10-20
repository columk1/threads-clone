import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulidx'

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

export const userTable = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  username: text('username').notNull(),
  emailVerified: integer('email_verified').notNull(),
})

export const sessionTable = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
  expiresAt: integer('expires_at').notNull(),
})

export const emailVerificationCodeTable = sqliteTable(
  'email_verification_code',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    code: text('code'),
    userId: text('user_id')
      .notNull()
      .references(() => userTable.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    expiresAt: integer('expires_at'),
  },
)

export const userTableRelations = relations(userTable, ({ many }) => ({
  session: many(sessionTable),
  emailVerificationCode: many(emailVerificationCodeTable),
}))

export const sessionTableRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}))

export const emailVerificationCodeRelations = relations(
  emailVerificationCodeTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [emailVerificationCodeTable.userId],
      references: [userTable.id],
    }),
  }),
)
