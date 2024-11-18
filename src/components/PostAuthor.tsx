'use client'

import cx from 'clsx'
import { type FunctionComponent, useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { PostUser } from '@/app/actions'
import { followUser } from '@/app/actions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'

import Avatar from './Avatar'

type PostAuthorProps = {
  user: PostUser
}

const PostAuthor: FunctionComponent<PostAuthorProps> = ({ user }) => {
  const [state, formAction, isPending] = useActionState(followUser, null)
  const [isFollowed, setIsFollowed] = useState(user.isFollowed)

  useEffect(() => {
    if (state?.success) {
      // Only toggle if the action was successful
      setIsFollowed(prev => !prev)
      toast(state.success)
    }
  }, [state?.success])

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>
          { user.username }
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex min-w-72 flex-col items-center justify-center gap-4 text-[15px] font-normal">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-semibold">
                  {user.name}
                </span>
                <span>{user.username}</span>
              </div>
              <Avatar size="md" />
            </div>
            <div className="flex flex-col gap-1.5 self-start">
              <div>
                Bio
                {user.bio}
              </div>
              <div className="text-gray-7">
                {`${Intl.NumberFormat().format(user.followerCount)} followers`}
              </div>
            </div>
            <form action={formAction} className="w-full">
              <input type="hidden" name="username" value={user.username} />
              <input type="hidden" name="actionType" value={isFollowed ? 'unfollow' : 'follow'} />
              <button type="submit" disabled={isPending} className={cx('w-full h-9 rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30', !isFollowed ? 'bg-white text-black' : 'text-primary-text')}>{isFollowed ? 'Unfollow' : 'Follow'}</button>
            </form>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PostAuthor
