'use client'

import cx from 'clsx'
import { type FunctionComponent, useState } from 'react'
import { toast } from 'sonner'

import type { PostUser } from '@/app/actions'
import { getUserInfo, toggleFollow } from '@/app/actions'
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

const PostAuthor: FunctionComponent<PostAuthorProps> = ({ user, isCurrentUser }) => {
  const [userData, setUserData] = useState<PostUser>(user)

  const handleFollowAction = async () => {
    const result = await toggleFollow(user.username, userData.isFollowed ? 'unfollow' : 'follow')
    if (result.error) {
      toast(result.error)
    }
    if (result.success) {
      setUserData(prev => ({ ...prev, isFollowed: !prev.isFollowed, followerCount: prev.isFollowed ? prev.followerCount - 1 : prev.followerCount + 1 }))
    }
  }

  const handleTooltipOpen = async (open: boolean) => {
    if (open) {
      const result = await getUserInfo(user.username)
      if (result.user) {
        setUserData(result.user)
      }
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip onOpenChange={handleTooltipOpen}>
        <TooltipTrigger>
          {userData.username}
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex w-72 flex-col items-center justify-center gap-4 text-[15px] font-normal">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-semibold">
                  {userData.name}
                </span>
                <span>{userData.username}</span>
              </div>
              <Avatar size="md" />
            </div>
            <div className="flex flex-col gap-1.5 self-start">
              <div>
                {userData.bio}
              </div>
              <div className="text-gray-7">
                {`${Intl.NumberFormat().format(userData.followerCount)} follower${userData.followerCount !== 1 ? 's' : ''}`}
              </div>
            </div>
            {!isCurrentUser && (
              <button
                type="button"
                onClick={handleFollowAction}
                className={cx(
                  'w-full h-9 rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30',
                  !userData.isFollowed ? 'bg-white text-black' : 'text-primary-text',
                )}
              >
                {userData.isFollowed ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PostAuthor
