'use client'

import type { FunctionComponent } from 'react'

import type { PostUser } from '@/app/actions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'
import { useModal } from '@/hooks/useModal'

import Avatar from './Avatar'
import FollowButton from './FollowButton'

type PostAuthorProps = {
  user: PostUser
  isCurrentUser: boolean
  isAuthenticated?: boolean
  onToggleFollow: () => Promise<void>
}

const PostAuthor: FunctionComponent<PostAuthorProps> = ({ user, isAuthenticated, isCurrentUser, onToggleFollow }) => {
  const { openModal } = useModal()

  const handleFollow = async () => {
    if (!isAuthenticated) {
      openModal('auth-prompt', 'follow')
      return
    }
    await onToggleFollow()
  }

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
              <FollowButton
                isFollowed={user.isFollowed}
                onToggleFollow={handleFollow}
              />
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PostAuthor
