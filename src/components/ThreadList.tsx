'use client'

import type { User } from 'lucia'
import { useEffect, useMemo, useRef } from 'react'

import { useAppStore } from '@/hooks/useAppStore'
import { useFocusRefresh } from '@/hooks/useFocusRefresh'

import Thread from './Thread'
import type { PostList } from './Threads'

export type ThreadListProps = {
  posts: PostList
  currentUser: User | null
  filter?: string
}

const ThreadList = ({ posts, currentUser, filter }: ThreadListProps) => {
  const updatePost = useAppStore((state) => state.updatePost)
  const lastInteractionTime = useRef<number>(0)

  // Memoize the interaction state string
  const interactionState = useMemo(() => posts.map((p) => p.post.isLiked || p.post.isReposted).join(','), [posts])

  // Update last interaction time when any post is interacted with
  useEffect(() => {
    lastInteractionTime.current = Date.now()
  }, [interactionState])

  // Memoize the current interaction time to use in the hook
  const currentInteractionTime = useMemo(() => lastInteractionTime.current, [lastInteractionTime])

  useFocusRefresh<PostList>({
    url: `/api/posts?user=${currentUser?.id || ''}${filter ? `&filter=${filter}` : ''}`,
    onUpdate: (data) => {
      data.forEach((item) => {
        updatePost(item.post.id, {
          isLiked: item.post.isLiked || false,
          likeCount: item.post.likeCount,
          replyCount: item.post.replyCount,
          isReposted: item.post.isReposted || false,
          repostCount: item.post.repostCount,
        })
      })
    },
    interactionTime: currentInteractionTime,
  })

  return (
    <>
      {posts.map((row) => (
        <Thread
          key={row.post.id}
          post={row.post}
          user={row.user}
          currentUser={currentUser}
          isAuthenticated={!!currentUser}
          isCurrentUser={currentUser ? row.user.username === currentUser.username : false}
        />
      ))}
    </>
  )
}

export default ThreadList
