import type { PostUser } from '@/services/users/users.queries'

import Avatar from './Avatar'
import ProfileNavigation from './ProfileNavigation'

type BaseProfileProps = {
  user: PostUser
  children: React.ReactNode
  actions: React.ReactNode
}

export default function BaseProfile({ user, children, actions }: BaseProfileProps) {
  return (
    <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
      <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-5 text-[15px] font-normal">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-semibold">{user.name}</span>
            <span>{user.username}</span>
          </div>
          <Avatar size="lg" url={user.avatar} priority />
        </div>
        <div className="flex flex-col gap-1.5 self-start">
          <div>{user.bio}</div>
          <div className="text-gray-7">
            {`${Intl.NumberFormat().format(user.followerCount)} follower${user.followerCount !== 1 ? 's' : ''}`}
          </div>
        </div>
        {actions}
      </div>
      <ProfileNavigation />
      {children}
    </div>
  )
}
