'use client'

import cx from 'clsx'
import { type FunctionComponent, useActionState, useEffect, useState } from 'react'

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
  isCurrentUser?: boolean
}

type FollowState = {
  isFollowed: boolean
  followerCount: number
}

const PostAuthor: FunctionComponent<PostAuthorProps> = ({ user, isCurrentUser }) => {
  const [state, formAction, isPending] = useActionState(followUser, null)
  const [followState, setFollowState] = useState<FollowState>({
    isFollowed: user.isFollowed,
    followerCount: user.followerCount,
  })

  useEffect(() => {
    if (state?.success) {
      setFollowState(prev => ({
        isFollowed: !prev.isFollowed,
        followerCount: prev.followerCount + (prev.isFollowed ? -1 : 1),
      }))
    }
  }, [state?.success])

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>
          { user.username }
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex w-72 flex-col items-center justify-center gap-4 text-[15px] font-normal">
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
                {user.bio}
              </div>
              <div className="text-gray-7">
                {`${Intl.NumberFormat().format(followState.followerCount)} follower${followState.followerCount !== 1 ? 's' : ''}`}
              </div>
            </div>
            {!isCurrentUser && (
              <form action={formAction} className="w-full">
                <input type="hidden" name="username" value={user.username} />
                <input type="hidden" name="actionType" value={followState.isFollowed ? 'unfollow' : 'follow'} />
                <button type="submit" disabled={isPending} className={cx('w-full h-9 rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30', !followState.isFollowed ? 'bg-white text-black' : 'text-primary-text')}>{followState.isFollowed ? 'Unfollow' : 'Follow'}</button>
              </form>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PostAuthor
