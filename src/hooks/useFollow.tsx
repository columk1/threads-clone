import { useState } from 'react'
import { toast } from 'sonner'

import type { FollowingResponseData } from '@/app/api/users/[userId]/following/route'
import { handleFollowAction } from '@/services/users/users.actions'
import type { PostUser, PublicUser } from '@/services/users/users.queries'

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
      //       const result = await isFollowing(user.username)
      // if (typeof result === 'boolean' && result !== user.isFollowed) {
      //   setUser((prev) => ({
      //     ...prev,
      //     isFollowed: result,
      //   }))
      try {
        const response = await fetch(`/api/users/${user.id}/following`)
        if (response.ok) {
          const result: FollowingResponseData = await response.json()
          if (typeof result === 'boolean' && result !== user.isFollowed) {
            setUser((prev) => ({
              ...prev,
              isFollowed: result,
            }))
          }
        }
      } catch (error) {
        console.error('Error checking follow status:', error)
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

      const result = await handleFollowAction(user.id, user.isFollowed ? 'unfollow' : 'follow')
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
