import { useEffect } from 'react'
import { toast } from 'sonner'

import type { FollowingResponseData } from '@/app/api/users/[userId]/following/route'
import { useAppStore } from '@/hooks/useAppStore'
import { handleFollowAction } from '@/services/users/users.actions'
import type { PostUser } from '@/services/users/users.queries'

import { useModal } from './useModal'

export const useFollow = ({
  initialUser,
  isAuthenticated = false,
}: {
  initialUser: PostUser
  isAuthenticated: boolean
}) => {
  const { openModal } = useModal()
  const updateUser = useAppStore((state) => state.updateUser)
  const storedUser = useAppStore((state) => state.users[initialUser.id])
  const addUsers = useAppStore((state) => state.addUsers)

  useEffect(() => {
    addUsers([
      {
        id: initialUser.id,
        isFollowed: initialUser.isFollowed,
        followerCount: initialUser.followerCount,
      },
    ])
  }, [initialUser, addUsers])

  const validateFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${initialUser.id}/following`)
      if (response.ok) {
        const result: FollowingResponseData = await response.json()
        if (typeof result === 'boolean' && result !== storedUser?.isFollowed) {
          updateUser(initialUser.id, {
            isFollowed: result,
            followerCount: result ? initialUser.followerCount + 1 : initialUser.followerCount - 1,
          })
        }
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      openModal('auth-prompt', 'follow')
      return
    }

    const currentFollowState = storedUser?.isFollowed ?? initialUser.isFollowed
    const currentFollowerCount = storedUser?.followerCount ?? initialUser.followerCount
    const newIsFollowed = !currentFollowState

    updateUser(initialUser.id, {
      isFollowed: newIsFollowed,
      followerCount: newIsFollowed ? currentFollowerCount + 1 : currentFollowerCount - 1,
    })

    const result = await handleFollowAction(initialUser.id, newIsFollowed ? 'follow' : 'unfollow')
    if (result.error) {
      toast.error(result.error)
      updateUser(initialUser.id, {
        isFollowed: currentFollowState,
        followerCount: currentFollowerCount,
      })
      return
    }
    // Threads only toasts on unfollow
    if (!newIsFollowed) {
      toast(result.success)
    }
  }

  return {
    user: {
      ...initialUser,
      ...(storedUser && {
        isFollowed: storedUser.isFollowed,
        followerCount: storedUser.followerCount,
      }),
    },
    handleToggleFollow,
    validateFollowStatus,
  }
}
