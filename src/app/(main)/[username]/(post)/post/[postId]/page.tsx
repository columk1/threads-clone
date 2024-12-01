import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { getPostById, getSinglePostById } from '@/app/actions'
import Header from '@/components/Header'
import Thread from '@/components/Thread'
import { validateRequest } from '@/libs/Lucia'
import { usernameParamSchema } from '@/models/zod.schema'

type Props = {
  params: Promise<{
    username: string
    postId: string
  }>
}

export default async function PostPage({ params }: Props) {
  const { user: currentUser } = await validateRequest()
  const postParams = await params
  const { postId } = postParams

  const result = usernameParamSchema.safeParse(postParams.username)
  if (!result.success) {
    notFound()
  }

  const username = result.data

  const isAuthenticated = !!currentUser
  const isCurrentUser = currentUser?.username === username

  const data = await getPostById(postId)
  if (!data || data[0]?.user?.username !== username) {
    notFound()
  }

  const thread = data.shift()
  if (!thread) {
    notFound()
  }

  const parentThread = thread.post.parentId ? await getSinglePostById(thread.post.parentId) : null

  return (
    <>
      <Header title="Thread" showBackButton />
      <div className="flex min-h-[120vh] w-full flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">

        {parentThread
          ? (
              <Suspense fallback={<p>Loading...</p>}>
                <Thread key={parentThread.post.id} user={parentThread.user} post={parentThread.post} isCurrentUser={isCurrentUser} isAuthenticated={isAuthenticated} isParent />
                <Thread key={thread.post.id} user={thread.user} post={thread.post} isCurrentUser={isCurrentUser} isAuthenticated={isAuthenticated} isTarget />
              </Suspense>
            )
          : (
              <Thread key={thread.post.id} user={thread.user} post={thread.post} isCurrentUser={isCurrentUser} isAuthenticated={isAuthenticated} isTarget />
            )}
        <div className="border-b-[0.5px] border-gray-5 px-6 py-3 text-[15px] font-semibold">Replies</div>

        {/* Replies */}
        {data.map((e) => {
          return (
            <Thread key={e.post.id} user={e.user} post={e.post} isCurrentUser={isCurrentUser} isAuthenticated={isAuthenticated} />
          )
        })}
      </div>
    </>
  )
}
