'use client'

import { useFollow } from '@/hooks/useFollow'
import type { PostUser } from '@/services/users/users.queries'

import BaseProfile from './BaseProfile'
import FollowButton from './FollowButton'

type VisitorProfileProps = {
  initialUser: PostUser
  children: React.ReactNode
}

export default function VisitorProfile({ initialUser, children }: VisitorProfileProps) {
  const { user, handleToggleFollow } = useFollow({ initialUser, isAuthenticated: true })

  const actions = (
    <div className="flex w-full gap-2">
      <FollowButton isAuthenticated isFollowed={user.isFollowed} onToggleFollow={handleToggleFollow} />
      <button
        type="button"
        className="h-9 w-full rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30"
      >
        Mention
      </button>
    </div>
  )

  return (
    <BaseProfile user={user} actions={actions}>
      {children}
    </BaseProfile>
  )
}
