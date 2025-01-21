import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import Header from '@/components/Header'
// Create a separate client component file for ScrollManager
import ScrollManager from '@/components/ScrollManager'
import Spinner from '@/components/spinner/Spinner'
import Thread from '@/components/Thread'
import { validateRequest } from '@/lib/Lucia'
import { usernameParamSchema } from '@/lib/schemas/zod.schema'
import { getAuthPostById, getPublicPostById, getSinglePostById } from '@/services/posts/posts.queries'

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
    return notFound()
  }

  const username = result.data

  const isAuthenticated = !!currentUser
  const isCurrentUser = currentUser?.username === username

  // const data: ResponseData = await fetch(`${BASE_URL}/api/posts/${postId}?user=${currentUser?.id}&replies=true`, { next: { revalidate: 60 } })
  //   .then(res => res.json())

  const getPostById = currentUser ? getAuthPostById : getPublicPostById

  const data = await getPostById(postId)

  // if ('error' in data) {
  //   return notFound()
  // }

  if (!Array.isArray(data) || data[0]?.user?.username !== username) {
    return notFound()
  }

  const [targetThread, ...replies] = data
  if (!targetThread) {
    return notFound()
  }

  // const parentThread = thread.post.parentId
  //   ? await fetch(`${BASE_URL}/api/posts/${thread.post.parentId}?user=${currentUser?.id}`, { cache: 'force-cache', next: { revalidate: 60 } })
  //     .then(res => res.json())
  //   : null
  const parentThread = targetThread.post.parentId ? await getSinglePostById(targetThread.post.parentId) : null

  return (
    <>
      <Header title="Thread" />
      <ScrollManager />
      <div className="flex min-h-[120vh] w-full flex-col pt-2 md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        {parentThread ? (
          <>
            <Thread
              key={parentThread.post.id}
              user={parentThread.user}
              post={parentThread.post}
              currentUser={currentUser}
              isCurrentUser={parentThread.user.username === currentUser?.username}
              isAuthenticated={isAuthenticated}
              isParent
            />
            <div id="target-thread">
              <Thread
                key={targetThread.post.id}
                user={targetThread.user}
                post={targetThread.post}
                currentUser={currentUser}
                isCurrentUser={isCurrentUser}
                isAuthenticated={isAuthenticated}
                isTarget
              />
            </div>
          </>
        ) : (
          <Thread
            key={targetThread.post.id}
            user={targetThread.user}
            post={targetThread.post}
            currentUser={currentUser}
            isCurrentUser={isCurrentUser}
            isAuthenticated={isAuthenticated}
            isTarget
          />
        )}

        <div className="mx-6 h-[0.5px] bg-gray-5"></div>
        <div className="px-6 py-3 text-[15px] font-semibold">Replies</div>

        {/* Replies */}
        <Suspense fallback={<Spinner size={10} />}>
          {replies.map((e) => (
            <Thread
              key={e.post.id}
              user={e.user}
              post={e.post}
              currentUser={currentUser}
              isCurrentUser={e.user.username === currentUser?.username}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </Suspense>
      </div>
    </>
  )
}
