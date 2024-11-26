import { useState } from 'react'
import { toast } from 'sonner'

import { type PostUser, type PublicUser, toggleFollow } from '@/app/actions'

import { useModal } from './useModal'

export const useFollow = ({ initialUser }: { initialUser: PostUser | PublicUser }) => {
  const [user, setUser] = useState(initialUser)
  const { openModal } = useModal()

  const handleToggleFollow = async () => {
    if ('isFollowed' in user) {
      // setUser(prev => ({
      //   ...prev,
      //   isFollowed: !prev.isFollowed,
      //   followerCount: prev.isFollowed ? prev.followerCount - 1 : prev.followerCount + 1,
      // }))
      setUser({
        ...user,
        isFollowed: !user.isFollowed,
        followerCount: user.isFollowed ? user.followerCount - 1 : user.followerCount + 1,
      })

      const result = await toggleFollow(user.username, user.isFollowed ? 'unfollow' : 'follow')
      if (result.error) {
        toast.error(result.error)
        setUser(user)
        return
      }
      // Threads only toasts on unfollow
      if (user.isFollowed) {
        toast(result.success)
      }
    } else {
      openModal('auth-prompt', 'follow')
    }
  }

  return { user, handleToggleFollow }
}
