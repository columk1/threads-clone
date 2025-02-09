import { type InferSelectModel, relations, sql } from 'drizzle-orm'
import { check, index, integer, primaryKey, type SQLiteColumn, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulidx'

// Use `npm run db:push` while prototyping
// Generate a new migration by running: `npm run db:generate`

// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

export const userSchema = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    googleId: text('google_id').unique(),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    name: text('name').notNull(),
    username: text('username').notNull(),
    emailVerified: integer('email_verified').notNull(),
    avatar: text('avatar'),
    bio: text('bio'),
    followerCount: integer('follower_count').notNull().default(0),
  },
  (table) => [index('username_idx').on(table.username)],
)

export type User = InferSelectModel<typeof userSchema>

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

export const emailVerificationCodeSchema = sqliteTable('email_verification_code', {
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
  expiresAt: integer('expires_at').notNull(),
})

export const postSchema = sqliteTable(
  'posts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    text: text('text'),
    image: text('image'),
    imageWidth: integer('image_width'),
    imageHeight: integer('image_height'),
    userId: text('user_id')
      .notNull()
      .references(() => userSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    parentId: text('parent_id').references((): SQLiteColumn => postSchema.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
    likeCount: integer('like_count').notNull().default(0),
    replyCount: integer('reply_count').notNull().default(0),
    repostCount: integer('repost_count').notNull().default(0),
    shareCount: integer('share_count').notNull().default(0),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
  },
  (table) => {
    return [
      index('user_idx').on(table.userId),
      index('parent_idx').on(table.parentId),
      check(
        'text_or_image',
        sql`(${table.text} IS NOT NULL AND TRIM(${table.text}) <> '') 
    OR (${table.image} IS NOT NULL AND TRIM(${table.image}) <> '')`,
      ),
    ]
  },
)

export type Post = InferSelectModel<typeof postSchema>

export const followerSchema = sqliteTable(
  'followers',
  {
    userId: text('user_id')
      .notNull()
      .references(() => userSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    followerId: text('follower_id')
      .notNull()
      .references(() => userSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    createdAt: integer('created_at').default(sql`(cast(unixepoch() as int))`),
  },
  (table) => {
    return [
      primaryKey({ columns: [table.userId, table.followerId] }),
      check('no_self_follow', sql`${table.userId} != ${table.followerId}`),
    ]
  },
)

export type Follower = InferSelectModel<typeof followerSchema>

export const likeSchema = sqliteTable(
  'likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => userSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    postId: text('post_id')
      .notNull()
      .references(() => postSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    createdAt: integer('created_at').default(sql`(cast(unixepoch() as int))`),
  },
  (table) => {
    return [primaryKey({ columns: [table.userId, table.postId] })]
  },
)

export type Like = InferSelectModel<typeof likeSchema>

export const repostSchema = sqliteTable(
  'reposts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => userSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    postId: text('post_id')
      .notNull()
      .references(() => postSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
  },
  (table) => {
    return [primaryKey({ columns: [table.userId, table.postId] })]
  },
)

export type Repost = InferSelectModel<typeof repostSchema>

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

export const emailVerificationCodeRelations = relations(emailVerificationCodeSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [emailVerificationCodeSchema.userId],
    references: [userSchema.id],
  }),
}))

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

export const repostRelations = relations(repostSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [repostSchema.userId],
    references: [userSchema.id],
  }),
  post: one(postSchema, {
    fields: [repostSchema.postId],
    references: [postSchema.id],
  }),
}))
