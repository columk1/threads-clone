import { eq, isNull, sql } from 'drizzle-orm'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { db } from '@/libs/DB'
import { followerSchema, likeSchema, postSchema, userSchema } from '@/models/Schema'

// type PostsResponse = {
//   post: {
//     id: string
//     createdAt: Date
//     text: string
//     userId: string
//     parentId: string | null
//     isLiked: boolean
//     likeCount: number
//   }
//   user: {
//     username: string
//     name: string
//     bio: string | null
//     followerCount: number
//     isFollowed: boolean
//   }
// }[]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username') || undefined
  const filter = searchParams.get('filter')
  // const { user } = await validateRequest()
  const userId = searchParams.get('user')

  if (!userId) {
    const query = db
      .select({
        post: postSchema,
        user: {
          username: userSchema.username,
          name: userSchema.name,
          bio: userSchema.bio,
          followerCount: userSchema.followerCount,
        },
      })
      .from(postSchema)
      .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
      .where(isNull(postSchema.parentId))
      .$dynamic()

    if (username) {
      query.where(eq(userSchema.username, username))
    }

    const posts = await query.all()

    const formattedPosts = posts.map(post => ({
      post: {
        ...post.post,
        isLiked: false,
      },
      user: {
        ...post.user,
        isFollowed: false,
      },
    }))
    return NextResponse.json(formattedPosts)
  }

  const query = db
    .select({
      post: postSchema,
      user: {
        username: userSchema.username,
        name: userSchema.name,
        bio: userSchema.bio,
        followerCount: userSchema.followerCount,
        isFollowed: sql<boolean>`EXISTS (
        SELECT 1 
        FROM ${followerSchema} 
        WHERE ${followerSchema.userId} = ${userSchema.id} 
          AND ${followerSchema.followerId} = ${userId}
      )`.as('isFollowed'),
      },
      isLiked: sql<boolean>`EXISTS (
        SELECT 1 
        FROM ${likeSchema} 
        WHERE ${likeSchema.userId} = ${userId} 
          AND ${likeSchema.postId} = ${postSchema.id}
      )`.as('isLiked'),
    })
    .from(postSchema)
    .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
    .where(isNull(postSchema.parentId))
    .$dynamic()

  if (username) {
    query.where(eq(userSchema.username, username))
  }

  if (filter === 'following') {
    query.innerJoin(followerSchema, eq(postSchema.userId, followerSchema.userId))
      .where(eq(followerSchema.followerId, userId))
  }

  const posts = await query.all()

  const formattedPosts = posts.map(post => ({
    // ...post,
    post: {
      ...post.post,
      isLiked: !!post.isLiked,
    },
    user: {
      ...post.user,
      isFollowed: !!post.user.isFollowed,
    },
  }))

  return NextResponse.json(formattedPosts)
}

export type PostsResponse = ReturnType<typeof GET> extends Promise<NextResponse<infer T>> ? T : never
