'use client'

import { type FunctionComponent, useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { followUser } from '@/app/actions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'

type PostAuthorProps = {
  username: string
  isFollowed: boolean
}

const PostAuthor: FunctionComponent<PostAuthorProps> = ({ username, isFollowed: initialIsFollowed }) => {
  const [state, formAction, isPending] = useActionState(followUser, null)
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed)

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
          { username }
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Is Followed:
            {`${!!isFollowed}`}
          </p>
          <form action={formAction}>
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="actionType" value={isFollowed ? 'unfollow' : 'follow'} />
            <button type="submit" disabled={isPending}>{isFollowed ? 'Unfollow' : 'Follow'}</button>
          </form>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default PostAuthor
