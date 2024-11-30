import { type InferSelectModel, relations, sql } from 'drizzle-orm'
import { check, index, integer, primaryKey, type SQLiteColumn, sqliteTable, text } from 'drizzle-orm/sqlite-core'
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

export const userSchema = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  username: text('username').notNull(),
  emailVerified: integer('email_verified').notNull(),
  bio: text('bio'),
  followerCount: integer('follower_count').notNull().default(0),
}, table => ({
  usernameIdx: index('username_idx').on(table.username),
}))

export const sessionSchema = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userSchema.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
  expiresAt: integer('expires_at').notNull(),
})

export const emailVerificationCodeSchema = sqliteTable(
  'email_verification_code',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    code: text('code'),
    userId: text('user_id')
      .notNull()
      .references(() => userSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    expiresAt: integer('expires_at'),
  },
)

export const postSchema = sqliteTable('posts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => ulid()),
  text: text('text').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => userSchema.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
  parentId: text('parent_id').references((): SQLiteColumn => postSchema.id, {
  }),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as int))`),
})

export type Post = InferSelectModel<typeof postSchema>

export const followerSchema = sqliteTable('followers', {
  userId: text('user_id').notNull().references(() => userSchema.id),
  followerId: text('follower_id').notNull().references(() => userSchema.id),
  createdAt: integer('created_at').default(sql`(cast(unixepoch() as int))`),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.followerId] }),
    checkConstraint: check('no_self_follow', sql`${table.userId} != ${table.followerId}`),
  }
})

export const likeSchema = sqliteTable('likes', {
  userId: text('user_id').notNull().references(() => userSchema.id),
  postId: text('post_id').notNull().references(() => postSchema.id),
  createdAt: integer('created_at').default(sql`(cast(unixepoch() as int))`),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.postId] }),
  }
})

export const userRelations = relations(userSchema, ({ many }) => ({
  session: many(sessionSchema),
  emailVerificationCode: many(emailVerificationCodeSchema),
  posts: many(postSchema),
  followers: many(followerSchema),
  likes: many(likeSchema),
}))

export const sessionRelations = relations(sessionSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [sessionSchema.userId],
    references: [userSchema.id],
  }),
}))

export const emailVerificationCodeRelations = relations(
  emailVerificationCodeSchema,
  ({ one }) => ({
    user: one(userSchema, {
      fields: [emailVerificationCodeSchema.userId],
      references: [userSchema.id],
    }),
  }),
)

export const followerRelations = relations(followerSchema, ({ one }) => ({
  follower: one(userSchema, {
    fields: [followerSchema.followerId],
    references: [userSchema.id],
  }),
}))

export const postRelations = relations(postSchema, ({ one, many }) => ({
  user: one(userSchema, {
    fields: [postSchema.userId],
    references: [userSchema.id],
  }),
  parent: one(postSchema, {
    fields: [postSchema.parentId],
    references: [postSchema.id],
  }),
  likes: many(likeSchema),
}))

export const likeRelations = relations(likeSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [likeSchema.userId],
    references: [userSchema.id],
  }),
  post: one(postSchema, {
    fields: [likeSchema.postId],
    references: [postSchema.id],
  }),
}))
