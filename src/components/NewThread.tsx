import { notFound } from 'next/navigation'
import type { FunctionComponent } from 'react'

import { getPublicUserInfo } from '@/app/actions'
import { validateRequest } from '@/libs/Lucia'

import Avatar from './Avatar'
import PostButton from './PostButton'

const NewThread: FunctionComponent = async () => {
  // TODO: Come up with lighter way of getting user here
  const { user } = await validateRequest()
  if (!user) {
    notFound()
  }
  const userData = await getPublicUserInfo(user.username)

  const avatar = 'user' in userData ? userData.user.avatar : null

  return (
    <div className="flex items-center border-b-[0.5px] border-gray-5 px-6 py-4 text-[15px] text-gray-7">
      <div className="flex flex-1 items-center gap-3">
        <Avatar size="sm" url={avatar} />
        {/* Same new post click handler here */}
        <PostButton className="flex-1 cursor-text text-left">What's new?</PostButton>
      </div>
      <PostButton className="ml-auto h-9 rounded-lg border border-gray-5 px-4 font-semibold text-primary-text transition active:scale-95">
        Post
      </PostButton>
    </div>
  )
}

export default NewThread
