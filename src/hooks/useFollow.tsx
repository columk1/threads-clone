import { useState } from 'react'
import { toast } from 'sonner'

import { getUserFollowStatus, type PostUser, type PublicUser, toggleFollow } from '@/app/actions'

import { useModal } from './useModal'

export const useFollow = ({ initialUser }: { initialUser: PostUser | PublicUser }) => {
  const [user, setUser] = useState(initialUser)
  const { openModal } = useModal()

  // Reset client user state if the avatar changes
  if (initialUser.avatar !== user.avatar) {
    setUser(initialUser)
  }

  const validateFollowStatus = async () => {
    if ('isFollowed' in user) {
      const result = await getUserFollowStatus(user.username)
      if (typeof result === 'boolean' && result !== user.isFollowed) {
        setUser(prev => ({
          ...prev,
          isFollowed: result,
        }))
      }
    }
  }

  const handleToggleFollow = async () => {
    if ('isFollowed' in user) {
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

  return { user, handleToggleFollow, validateFollowStatus }
}
