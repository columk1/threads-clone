'use client'

import cx from 'clsx'
import type { FunctionComponent } from 'react'

import type { PostUser } from '@/app/actions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'

import Avatar from './Avatar'

type PostAuthorProps = {
  user: PostUser
  isCurrentUser: boolean
  onFollowToggle: () => Promise<{ error?: string, success?: string }>
}

const PostAuthor: FunctionComponent<PostAuthorProps> = ({ user, isCurrentUser, onFollowToggle }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href={`/@${user.username}`} className="hover:underline">
            {user.username}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex w-72 flex-col items-center justify-center gap-4 text-[15px] font-normal">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-semibold">
                  {user.username}
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
                {`${Intl.NumberFormat().format(user.followerCount)} follower${user.followerCount !== 1 ? 's' : ''}`}
              </div>
            </div>
            {!isCurrentUser && (
              <button
                type="button"
                onClick={onFollowToggle}
                className={cx(
                  'w-full h-9 rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30',
                  !user.isFollowed ? 'bg-white text-black' : 'text-primary-text',
                )}
              >
                {user.isFollowed ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PostAuthor
