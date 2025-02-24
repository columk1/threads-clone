import { type InferSelectModel, relations, sql } from 'drizzle-orm'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import {
  check,
  customType,
  index,
  integer,
  primaryKey,
  type SQLiteColumn,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'
import { ulid } from 'ulidx'

// Use `npm run db:push` while prototyping
// Generate a new migration by running: `npm run db:generate`

// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

export type Transaction = Parameters<Parameters<LibSQLDatabase<any>['transaction']>[0]>[0]

const textEnum = <V extends Record<string, string>, RV = V[keyof V]>(
  columnName: string,
  enumObj: V,
  message?: string,
) => {
  const colFn = customType<{
    data: string
    driverData: string
  }>({
    dataType() {
      return 'text'
    },
    toDriver(value: string): string {
      const values = Object.values(enumObj)
      if (!values.includes(value)) {
        throw new Error(
          message ?? `Invalid value for column ${columnName}. Expected:${values.join(',')} | Found:${value}`,
        )
      }
      return value
    },
  })
  return colFn(columnName).$type<RV>()
}

export const notificationTypeEnum = {
  FOLLOW: 'FOLLOW',
  LIKE: 'LIKE',
  REPLY: 'REPLY',
  REPOST: 'REPOST',
} as const

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
  (table) => [index('username_idx').on(table.followerCount)],
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

export const notificationSchema = sqliteTable(
  'notifications',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text('user_id')
      .notNull()
      .references(() => userSchema.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      }),
    type: textEnum('type', notificationTypeEnum).notNull(),
    sourceUserId: text('source_user_id').references(() => userSchema.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
    postId: text('post_id').references(() => postSchema.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
    replyId: text('reply_id').references(() => postSchema.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
    seen: integer('seen', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at')
      .notNull()
      .default(sql`(cast(unixepoch() as int))`),
  },
  (table) => {
    return [
      // Check constraint for field requirements based on type
      check(
        'notification_type_fields',
        sql`(${table.type} = 'FOLLOW' AND ${table.postId} IS NULL AND ${table.replyId} IS NULL)
          OR (${table.type} IN ('LIKE', 'REPOST') AND ${table.postId} IS NOT NULL AND ${table.replyId} IS NULL)
          OR (${table.type} = 'REPLY' AND ${table.postId} IS NOT NULL AND ${table.replyId} IS NOT NULL)`,
      ),

      index('notif_user_seen_created_idx')
        .on(table.userId, table.seen, table.createdAt)
        .where(sql`${table.seen} = 0`),

      // This should work soon: https://github.com/drizzle-team/drizzle-orm/issues/3350
      // uniqueIndex('notif_unique_constraint').on(
      //   table.userId,
      //   table.sourceUserId,
      //   sql`COALESCE(${table.postId}, '')`,
      //   sql`COALESCE(${table.replyId}, '')`,
      //   table.type,
      // ),
    ]
  },
)

export type Notification = InferSelectModel<typeof notificationSchema>

export const userRelations = relations(userSchema, ({ many }) => ({
  session: many(sessionSchema),
  emailVerificationCode: many(emailVerificationCodeSchema),
  posts: many(postSchema),
  followers: many(followerSchema),
  likes: many(likeSchema),
  notificationReceiver: many(notificationSchema, { relationName: 'notification_receiving_user' }),
  notificationSender: many(notificationSchema, { relationName: 'notification_source_user' }),
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

export const notificationRelations = relations(notificationSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [notificationSchema.userId],
    references: [userSchema.id],
    relationName: 'notification_receiving_user',
  }),

  sourceUser: one(userSchema, {
    fields: [notificationSchema.sourceUserId],
    references: [userSchema.id],
    relationName: 'notification_source_user',
  }),

  post: one(postSchema, {
    fields: [notificationSchema.postId],
    references: [postSchema.id],
  }),
}))
