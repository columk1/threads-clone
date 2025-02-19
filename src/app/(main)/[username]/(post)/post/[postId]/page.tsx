import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { ContentPane } from '@/components/ContentPane'
import Header from '@/components/Header'
import HydrateStore from '@/components/HydrateStore'
import Spinner from '@/components/spinner/Spinner'
import Thread from '@/components/Thread'
import ThreadView from '@/components/ThreadView'
import { validateRequest } from '@/lib/Lucia'
import { usernameParamSchema } from '@/lib/schemas/zod.schema'
import { getAuthPostById, getPublicPostById } from '@/services/posts/posts.queries'

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

  const isAuthenticated = Boolean(currentUser)
  const isCurrentUser = currentUser?.username === username

  const getPostById = isAuthenticated ? getAuthPostById : getPublicPostById

  const data = await getPostById(postId)

  if (!Array.isArray(data)) {
    return notFound()
  }

  const parentThread = data[0]?.post.id !== postId ? data[0] : null

  const [targetThread, ...replies] = parentThread ? data.slice(1) : data

  if (!targetThread) {
    return notFound()
  }

  return (
    <>
      <HydrateStore initialPosts={data} />
      <Header title="Thread" />
      {/* <div className="flex min-h-[120vh] w-full flex-col pt-2 md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg"> */}
      <ContentPane>
        <ThreadView
          parentThread={parentThread}
          targetThread={targetThread}
          currentUser={currentUser}
          isCurrentUser={isCurrentUser}
          isAuthenticated={isAuthenticated}
        />

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
      </ContentPane>
    </>
  )
}
