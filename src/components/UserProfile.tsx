'use client'

import { useFollow } from '@/hooks/useFollow'
import type { PostUser, PublicUser } from '@/services/users/users.queries'

import Avatar from './Avatar'
import FollowButton from './FollowButton'
import ProfileNavigation from './ProfileNavigation'

export default function UserProfile({
  initialUser,
  children,
}: {
  initialUser: PublicUser | PostUser
  children: React.ReactNode
}) {
  const { user, handleToggleFollow } = useFollow({ initialUser })
  const isAuthenticated = 'isFollowed' in user

  return (
    <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
      <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-5 text-[15px] font-normal">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-semibold">{user.name}</span>
            <span>{user.username}</span>
          </div>
          <Avatar size="lg" url={user.avatar} />
        </div>
        <div className="flex flex-col gap-1.5 self-start">
          <div>{user.bio}</div>
          <div className="text-gray-7">
            {`${Intl.NumberFormat().format(user.followerCount)} follower${user.followerCount !== 1 ? 's' : ''}`}
          </div>
        </div>
        <div className="flex w-full gap-2">
          <FollowButton
            isAuthenticated={isAuthenticated}
            isFollowed={'isFollowed' in user ? user.isFollowed : false}
            onToggleFollow={handleToggleFollow}
          />
          <button
            type="button"
            className="h-9 w-full rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30"
          >
            Mention
          </button>
        </div>
      </div>
      <ProfileNavigation />
      {children}
    </div>
  )
}
