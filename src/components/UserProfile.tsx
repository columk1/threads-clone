'use client'

import { useFollow } from '@/hooks/useFollow'
import type { PostUser } from '@/services/users/users.queries'

import BaseProfile from './BaseProfile'
import FollowButton from './FollowButton'
import UnfollowModal from './UnfollowModal'

type VisitorProfileProps = {
  initialUser: PostUser
  children: React.ReactNode
  isAuthenticated: boolean
}

export default function VisitorProfile({ initialUser, children, isAuthenticated }: VisitorProfileProps) {
  const { user, handleToggleFollow, unfollowModalProps } = useFollow({ initialUser, isAuthenticated })

  const actions = (
    <div className="flex w-full gap-2">
      <FollowButton isFollowed={user.isFollowed} isFollower={user.isFollower} onToggleFollow={handleToggleFollow} />
      <button
        type="button"
        className="h-9 w-full rounded-lg border border-primary-outline px-4 text-ms font-semibold transition active:scale-95 disabled:opacity-30"
      >
        Mention
      </button>
    </div>
  )

  return (
    <BaseProfile user={user} actions={actions}>
      {isAuthenticated && <UnfollowModal {...unfollowModalProps} />}
      {children}
    </BaseProfile>
  )
}
