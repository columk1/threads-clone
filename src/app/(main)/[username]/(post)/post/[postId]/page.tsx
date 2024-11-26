import { notFound } from 'next/navigation'

import { getPostById } from '@/app/actions'
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
  if (!data || data.user.username !== username) {
    notFound()
  }

  return (
    <>
      <Header title="Thread" />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <Thread user={data.user} post={data.post} isCurrentUser={isCurrentUser} isAuthenticated={isAuthenticated} />
      </div>
    </>
  )
}
