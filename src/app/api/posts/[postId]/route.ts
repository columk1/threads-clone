import { eq, or, sql } from 'drizzle-orm'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { db } from '@/libs/DB'
import { followerSchema, likeSchema, postSchema, userSchema } from '@/models/Schema'

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId: id } = await params
  const { searchParams } = new URL(request.url)
  const replies = searchParams.get('replies') === 'true' // Check if replies=true is passed
  // const { user } = await validateRequest()
  const userId = searchParams.get('user') // Todo: replace this with auth check

  if (!id) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
  }

  // Base query for fetching post and author info
  const baseSelect = {
    post: postSchema,
    user: {
      username: userSchema.username,
      name: userSchema.name,
      bio: userSchema.bio,
      followerCount: userSchema.followerCount,
    },
  }

  // If the user is not authenticated (public route)
  if (!userId) {
    const results = await db
      .select(baseSelect)
      .from(postSchema)
      .innerJoin(userSchema, eq(postSchema.userId, userSchema.id))
      .where(
        or(
          eq(postSchema.id, id),
          eq(postSchema.parentId, id),
        ),
      )
      .orderBy(postSchema.createdAt)
      .all()

    if (!results.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const formattedData = results.map(result => ({
      ...result,
      post: {
        ...result.post,
        isLiked: false,
      },
      user: {
        ...result.user,
        isFollowed: false,
      },
    }))

    return NextResponse.json(formattedData)
  }

  // Authenticated user query
  if (!replies) {
    // If replies is not true, return only the single post
    const singlePost = await db
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
      .where(eq(postSchema.id, id))
      .get()

    if (!singlePost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Format and return the single post
    return NextResponse.json({
      ...singlePost,
      user: { ...singlePost.user, isFollowed: false },
    })
  }

  // If replies=true, fetch all replies including the parent post
  const results = await db
    .select({
      ...baseSelect,
      user: {
        ...baseSelect.user,
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
    .where(or(eq(postSchema.id, id), eq(postSchema.parentId, id)))
    .orderBy(postSchema.createdAt)
    .all()

  if (!results.length) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const formattedData = results.map(result => ({
    ...result,
    post: {
      ...result.post,
      isLiked: !!result.isLiked,
    },
    user: {
      ...result.user,
      isFollowed: !!result.user.isFollowed,
    },
  }))
  return NextResponse.json(formattedData)
}

export type ResponseData = ReturnType<typeof GET> extends Promise<NextResponse<infer T>> ? T : never
