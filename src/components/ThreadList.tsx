'use client'

import type { User } from 'lucia'
import { useEffect, useMemo, useRef } from 'react'

import { useAppStore } from '@/hooks/useAppStore'

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
  const updateTimeoutRef = useRef<NodeJS.Timeout>(null)

  // Memoize the interaction state string
  const interactionState = useMemo(() => posts.map((p) => p.post.isLiked || p.post.isReposted).join(','), [posts])

  // Update posts data when window gains focus
  useEffect(() => {
    const updatePostsData = async () => {
      try {
        const response = await fetch(`/api/posts?user=${currentUser?.id || ''}${filter ? `&filter=${filter}` : ''}`)
        if (!response.ok) {
          return
        }

        const data = await response.json()
        // Update each post in the store
        data.forEach((item: any) => {
          updatePost(item.post.id, {
            isLiked: item.post.isLiked || false,
            likeCount: item.post.likeCount,
            replyCount: item.post.replyCount,
            isReposted: item.post.isReposted || false,
            repostCount: item.post.repostCount,
          })
        })
      } catch (error) {
        console.error('Error updating posts data:', error)
      }
    }

    const onFocus = () => {
      // Clear any pending update
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      // Check if we should skip due to recent interaction
      const currentTime = Date.now()
      if (currentTime - lastInteractionTime.current < 2000) {
        return
      }

      // Add a small delay to allow for any pending interactions to complete
      updateTimeoutRef.current = setTimeout(() => {
        updatePostsData()
      }, 100)
    }

    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [currentUser?.id, updatePost, filter])

  // Update last interaction time when any post is interacted with
  useEffect(() => {
    lastInteractionTime.current = Date.now()
  }, [interactionState])

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
