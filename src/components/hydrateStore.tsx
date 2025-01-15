'use client'

import { useEffect } from 'react'

import { useAppStore } from '@/hooks/useAppStore'
import type { getPosts } from '@/services/posts/posts.queries'

type HydrateStoreProps = {
  initialPosts: Awaited<ReturnType<typeof getPosts>>
}

const HydrateStore = ({ initialPosts }: HydrateStoreProps) => {
  const addPosts = useAppStore((state) => state.addPosts)
  const addUsers = useAppStore((state) => state.addUsers)

  useEffect(() => {
    if (initialPosts) {
      addPosts(initialPosts)
      // Extract users from posts and hydrate users store
      const users = initialPosts
        .map(({ user }) => ({
          id: user.id,
          isFollowed: 'isFollowed' in user ? user.isFollowed : false,
          followerCount: 'followerCount' in user ? user.followerCount : 0,
        }))
        .filter((user) => 'isFollowed' in user)
      addUsers(users)
    }
  }, [initialPosts, addPosts, addUsers])

  return null
}

export default HydrateStore
