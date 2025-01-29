import { eq } from 'drizzle-orm'
import { ulid } from 'ulidx'

import type { Post, User } from '@/lib/db/Schema'
import * as schema from '@/lib/db/Schema'

import { testDb } from './testDb'

export async function createTestUser(overrides: Partial<User> = {}): Promise<User> {
  const id = ulid()
  const defaultUser = {
    id,
    googleId: null,
    email: `${id}@example.com`,
    password: 'password123',
    name: `Test User ${id}`,
    username: `testuser_${id}`,
    emailVerified: 1,
    followerCount: 0,
    avatar: null as string | null,
    bio: null as string | null,
  }

  const user = { ...defaultUser, ...overrides }
  await testDb.insert(schema.userSchema).values(user)
  return user
}

export async function createTestPost(overrides: Partial<Post> = {}): Promise<Post> {
  const id = ulid()
  const defaultPost = {
    id,
    userId: overrides.userId || ulid(),
    text: `Test post ${id}`,
    image: null as string | null,
    imageWidth: null as number | null,
    imageHeight: null as number | null,
    parentId: null as string | null,
    likeCount: 0,
    replyCount: 0,
    repostCount: 0,
    shareCount: 0,
    createdAt: Math.floor(Date.now() / 1000),
  }

  const post = { ...defaultPost, ...overrides }
  await testDb.insert(schema.postSchema).values(post)
  return post
}

export async function followUser(userId: string, followerId: string): Promise<void> {
  await testDb.insert(schema.followerSchema).values({
    userId,
    followerId,
    createdAt: Math.floor(Date.now() / 1000),
  })

  await testDb.update(schema.userSchema).set({ followerCount: 1 }).where(eq(schema.userSchema.id, userId))
}
