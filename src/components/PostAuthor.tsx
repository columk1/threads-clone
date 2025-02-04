'use client'

import type { FunctionComponent } from 'react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/Tooltip'
import type { PostUser } from '@/services/users/users.queries'

import UserCard from './UserCard'

type PostAuthorProps = {
  user: PostUser
  isCurrentUser?: boolean
  onToggleFollow?: () => Promise<void>
}

const PostAuthor: FunctionComponent<PostAuthorProps> = ({ user, isCurrentUser = false, onToggleFollow }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a href={`/@${user.username}`} className="relative z-10 font-semibold hover:underline">
            {user.username}
          </a>
        </TooltipTrigger>
        <TooltipContent className="w-80">
          <UserCard user={user} isCurrentUser={isCurrentUser} onToggleFollow={onToggleFollow} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PostAuthor
