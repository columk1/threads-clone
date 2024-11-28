import { notFound } from 'next/navigation'

import { getPostById } from '@/app/actions'
import BackButton from '@/components/BackButton'
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

  const parentThread = data.shift()
  if (!parentThread) {
    notFound()
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <BackButton />
        <Header title="Thread" />
      </div>
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <Thread user={parentThread.user} post={parentThread.post} isCurrentUser={isCurrentUser} isAuthenticated={isAuthenticated} />
        <div className="border-b-[0.5px] border-gray-5 px-6 py-3 text-[15px] font-semibold">Replies</div>
        {data.map((e) => {
          return (
            <Thread key={e.post.id} user={e.user} post={e.post} isCurrentUser={isCurrentUser} isAuthenticated={isAuthenticated} />
          )
        })}
      </div>
    </>
  )
}
