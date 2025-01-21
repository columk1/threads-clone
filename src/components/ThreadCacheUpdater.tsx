'use client'

import type { User } from 'lucia'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'

import { useAppStore } from '@/hooks/useAppStore'
import { useFocusRefresh } from '@/hooks/useFocusRefresh'

import type { PostList } from './Threads'

type ThreadCacheUpdaterProps = {
  postId: string
  currentUser: User | null
  initialData: PostList
  children: React.ReactNode
}

export default function ThreadCacheUpdater({ postId, currentUser, initialData, children }: ThreadCacheUpdaterProps) {
  const router = useRouter()
  const setPosts = useAppStore((state) => state.setPosts)
  const lastInteractionTime = useRef<number>(0)

  // Initialize posts in store
  useEffect(() => {
    setPosts(initialData)
  }, [initialData, setPosts])

  // Track the main post's interaction state
  const interactionState = useMemo(() => {
    const post = useAppStore.getState().posts[postId]
    return post ? `${post.isLiked || false},${post.isReposted || false}` : ''
  }, [postId])

  // Update last interaction time when the post is interacted with
  useEffect(() => {
    if (interactionState) {
      lastInteractionTime.current = Date.now()
    }
  }, [interactionState])

  useFocusRefresh<PostList>({
    url: `/api/posts/${postId}?user=${currentUser?.id || ''}&replies=true`,
    onUpdate: () => router.refresh(),
    interactionTime: lastInteractionTime.current,
    enabled: true,
  })

  return <>{children}</>
}
