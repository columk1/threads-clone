import { useEffect, useState } from 'react'
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
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false)
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

  const handleFollow = async () => {
    if (!isAuthenticated) {
      openModal('auth-prompt', 'follow')
      return
    }

    // Get the most up-to-date state
    const currentUser = storedUser ?? {
      id: initialUser.id,
      isFollowed: initialUser.isFollowed,
      followerCount: initialUser.followerCount,
    }

    // Optimistically update UI
    updateUser(initialUser.id, {
      isFollowed: true,
      followerCount: currentUser.followerCount + 1,
    })

    const result = await handleFollowAction(initialUser.id, 'follow')
    if (result.error) {
      toast.error(result.error)
      // Revert optimistic update on error
      updateUser(initialUser.id, {
        isFollowed: currentUser.isFollowed,
        followerCount: currentUser.followerCount,
      })
    }
  }

  const handleUnfollow = async () => {
    // Get the most up-to-date state
    const currentUser = storedUser ?? {
      id: initialUser.id,
      isFollowed: initialUser.isFollowed,
      followerCount: initialUser.followerCount,
    }

    // Optimistically update UI
    updateUser(initialUser.id, {
      isFollowed: false,
      followerCount: currentUser.followerCount - 1,
    })

    const result = await handleFollowAction(initialUser.id, 'unfollow')
    if (result.error) {
      toast.error(result.error)
      // Revert optimistic update on error
      updateUser(initialUser.id, {
        isFollowed: currentUser.isFollowed,
        followerCount: currentUser.followerCount,
      })
      return
    }
    toast(result.success)
    setIsUnfollowModalOpen(false)
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      openModal('auth-prompt', 'follow')
      return
    }

    // Get the most up-to-date follow state by checking both store and initial data
    const currentUser = storedUser ?? {
      id: initialUser.id,
      isFollowed: initialUser.isFollowed,
      followerCount: initialUser.followerCount,
    }

    if (currentUser.isFollowed) {
      setIsUnfollowModalOpen(true)
    } else {
      await handleFollow()
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
    unfollowModalProps: {
      user: initialUser,
      handleUnfollow,
      open: isUnfollowModalOpen,
      onOpenChange: setIsUnfollowModalOpen,
    },
  }
}
