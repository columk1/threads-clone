import type { FunctionComponent } from 'react'

import type { PostUser } from '@/app/actions'

import Avatar from './Avatar'
import FollowButton from './FollowButton'

type UserCardProps = {
  user: PostUser
  isCurrentUser?: boolean
  isAuthenticated?: boolean
  onToggleFollow?: () => Promise<void>
}

const UserCard: FunctionComponent<UserCardProps> = ({ user, isAuthenticated = false, isCurrentUser = false, onToggleFollow }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-[15px] font-normal">
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
          isAuthenticated={isAuthenticated}
          isFollowed={user.isFollowed}
          onToggleFollow={onToggleFollow}
        />
      )}
    </div>
  )
}

export default UserCard
