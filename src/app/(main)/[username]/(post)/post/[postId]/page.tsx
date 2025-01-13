import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { getAuthPostById, getPublicPostById, getSinglePostById } from '@/app/actions'
import Header from '@/components/Header'
import Thread from '@/components/Thread'
import { validateRequest } from '@/lib/Lucia'
import { usernameParamSchema } from '@/lib/schemas/zod.schema'

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

  // const data: ResponseData = await fetch(`${BASE_URL}/api/posts/${postId}?user=${currentUser?.id}&replies=true`, { next: { revalidate: 60 } })
  //   .then(res => res.json())

  const getPostById = currentUser ? getAuthPostById : getPublicPostById

  const data = await getPostById(postId)

  // if ('error' in data) {
  //   notFound()
  // }

  if (!Array.isArray(data)) {
    notFound()
  }

  if (!data || data[0]?.user?.username !== username) {
    notFound()
  }

  const thread = data.shift()
  if (!thread) {
    notFound()
  }

  // const parentThread = thread.post.parentId
  //   ? await fetch(`${BASE_URL}/api/posts/${thread.post.parentId}?user=${currentUser?.id}`, { cache: 'force-cache', next: { revalidate: 60 } })
  //     .then(res => res.json())
  //   : null
  const parentThread = thread.post.parentId ? await getSinglePostById(thread.post.parentId) : null

  return (
    <>
      <Header title="Thread" />
      <div className="flex min-h-[120vh] w-full flex-col pt-2 md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        {parentThread ? (
          <Suspense fallback={<p>Loading...</p>}>
            <Thread
              key={parentThread.post.id}
              user={parentThread.user}
              post={parentThread.post}
              currentUser={currentUser}
              isCurrentUser={parentThread.user.username === currentUser?.username}
              isAuthenticated={isAuthenticated}
              isParent
            />
            <Thread
              key={thread.post.id}
              user={thread.user}
              post={thread.post}
              currentUser={currentUser}
              isCurrentUser={isCurrentUser}
              isAuthenticated={isAuthenticated}
              isTarget
            />
          </Suspense>
        ) : (
          <Thread
            key={thread.post.id}
            user={thread.user}
            post={thread.post}
            currentUser={currentUser}
            isCurrentUser={isCurrentUser}
            isAuthenticated={isAuthenticated}
            isTarget
          />
        )}

        <div className="mx-6 h-[0.5px] bg-gray-5"></div>
        <div className="px-6 py-3 text-[15px] font-semibold">Replies</div>

        {/* Replies */}
        {data.map((e) => {
          return (
            <Thread
              key={e.post.id}
              user={e.user}
              post={e.post}
              currentUser={currentUser}
              isCurrentUser={e.user.username === currentUser?.username}
              isAuthenticated={isAuthenticated}
            />
          )
        })}
      </div>
    </>
  )
}
