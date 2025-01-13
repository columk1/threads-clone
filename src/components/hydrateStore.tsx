'use client'

import { useEffect } from 'react'

import { useAppStore } from '@/hooks/useAppStore'
import type { getPosts } from '@/services/posts/posts.queries'

type HydrateStoreProps = {
  initialPosts: Awaited<ReturnType<typeof getPosts>>
}

const HydrateStore = ({ initialPosts }: HydrateStoreProps) => {
  const addPosts = useAppStore((state) => state.addPosts)

  useEffect(() => {
    if (initialPosts) {
      addPosts(initialPosts)
    }
  }, [initialPosts, addPosts])

  return null
}

export default HydrateStore
