import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { FunctionComponent } from 'react'

import { validateRequest } from '@/libs/Lucia'

import Avatar from './Avatar'
import PostButton from './PostButton'

const NewThread: FunctionComponent = async () => {
  // TODO: Come up with lighter way of getting user here
  const { user } = await validateRequest()
  if (!user) {
    notFound()
  }
  const avatar = user.avatar

  return (
    <div className="flex items-center px-6 py-4 text-[15px] text-gray-7">
      <div className="flex flex-1 items-center gap-3">
        <Link href={`/@${user.username}`}>
          <Avatar size="sm" url={avatar} />
        </Link>
        <PostButton className="flex w-full items-center">
          <div className="flex-1 cursor-text text-left">What's new?</div>
          <div className="z-10 ml-auto flex h-9 items-center rounded-lg border border-gray-5 px-4 font-semibold text-primary-text transition active:scale-95">
            Post
          </div>
        </PostButton>
      </div>
    </div>
  )
}

export default NewThread
