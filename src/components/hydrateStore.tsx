'use client'

import { useEffect } from 'react'

import type { getAllPosts } from '@/app/actions'
import { useAppStore } from '@/hooks/useAppStore'

type HydrateStoreProps = {
  initialPosts: Awaited<ReturnType<typeof getAllPosts>>
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
