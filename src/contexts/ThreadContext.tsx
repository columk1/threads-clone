import { useRouter } from 'next/navigation'
import { createContext, type ReactNode, useCallback, useContext, useMemo } from 'react'

import { useFollow } from '@/hooks/useFollow'
import type { SessionUser } from '@/lib/Session'
import type { PostData } from '@/repositories/posts.repository'
import type { PostUser } from '@/services/users/users.queries'

type ThreadContextType = {
  post: PostData
  user: PostUser & { isFollowed: boolean; followerCount: number }
  currentUser: SessionUser | null
  isCurrentUser: boolean
  isAuthenticated: boolean
  isTarget: boolean
  isParent: boolean
  imagePriority: boolean
  reposted?: { username: string; createdAt: number }
  handleToggleFollow: () => Promise<void>
  navigateToThread: () => void
  unfollowModalProps: {
    user: PostUser
    handleUnfollow: () => Promise<void>
    open: boolean
    onOpenChange: (open: boolean) => void
  }
}

const ThreadContext = createContext<ThreadContextType | null>(null)

export const useThread = () => {
  const context = useContext(ThreadContext)
  if (!context) {
    throw new Error('useThread must be used within a ThreadProvider')
  }
  return context
}

type ThreadProviderProps = {
  children: ReactNode
  post: PostData
  user: PostUser
  currentUser: SessionUser | null
  isCurrentUser: boolean
  isAuthenticated: boolean
  isTarget?: boolean
  isParent?: boolean
  imagePriority?: boolean
  reposted?: { username: string; createdAt: number }
}

export function ThreadProvider({
  children,
  post,
  user: initialUser,
  currentUser,
  isCurrentUser,
  isAuthenticated,
  isTarget = false,
  isParent = false,
  imagePriority = false,
  reposted,
}: ThreadProviderProps) {
  const router = useRouter()
  const { user, handleToggleFollow, unfollowModalProps } = useFollow({
    initialUser,
    isAuthenticated,
  })

  const navigateToThread = useCallback(() => {
    router.push(`/@${user.username}/post/${post.id}`)
  }, [router, user, post])

  const value = useMemo(
    () => ({
      post,
      user,
      currentUser,
      isCurrentUser,
      isAuthenticated,
      isTarget,
      isParent,
      imagePriority,
      reposted,
      handleToggleFollow,
      navigateToThread,
      unfollowModalProps,
    }),
    [
      post,
      user,
      currentUser,
      isCurrentUser,
      isAuthenticated,
      isTarget,
      isParent,
      imagePriority,
      reposted,
      handleToggleFollow,
      navigateToThread,
      unfollowModalProps,
    ],
  )

  return <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
}
