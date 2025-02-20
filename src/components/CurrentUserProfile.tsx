import type { PostUser } from '@/services/users/users.queries'

import BaseProfile from './BaseProfile'
import ProfileModal from './ProfileModal'

type CurrentUserProfileProps = {
  user: PostUser
  children: React.ReactNode
}

export default function CurrentUserProfile({ user, children }: CurrentUserProfileProps) {
  const actions = (
    <ProfileModal
      user={user}
      trigger={
        <button
          type="button"
          className="h-9 w-full rounded-lg border border-primary-outline px-4 text-ms font-semibold transition active:scale-95 disabled:opacity-30"
        >
          Edit Profile
        </button>
      }
    />
  )

  return (
    <BaseProfile user={user} actions={actions}>
      {children}
    </BaseProfile>
  )
}
