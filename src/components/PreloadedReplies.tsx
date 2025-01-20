'use client'

import type { User } from 'lucia'
import { use } from 'react'

import type { Post } from '@/lib/db/Schema'
import type { PostUser } from '@/services/users/users.queries'

import Thread from './Thread'

type PreloadedRepliesProps = {
  data: Array<{
    post: Post & { isLiked?: boolean; isReposted?: boolean }
    user: PostUser
  }>
  currentUser: User | null
  isAuthenticated: boolean
}

let preloadPromise: Promise<void> | null = null

function preloadImages(posts: PreloadedRepliesProps['data'], maxImages = 3, maxReplies = 8): Promise<void> {
  // Return cached promise if it exists
  if (preloadPromise) {
    return preloadPromise
  }

  // If we're not in the browser, resolve immediately
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  const imagePromises = []
  let imageCount = 0
  let replyCount = 0

  for (const post of posts) {
    if (replyCount >= maxReplies || imageCount >= maxImages) {
      break
    }

    replyCount++
    if (post.post.image) {
      imageCount++
      imagePromises.push(
        new Promise<void>((resolve) => {
          const img = new window.Image()
          img.onload = () => resolve()
          img.onerror = () => resolve() // Don't reject on error, just continue
          img.src = post.post.image!
        }),
      )
    }
  }

  if (imagePromises.length === 0) {
    preloadPromise = Promise.resolve()
    return preloadPromise
  }

  preloadPromise = Promise.all(imagePromises).then(() => undefined)
  return preloadPromise
}

export default function PreloadedReplies({ data, currentUser, isAuthenticated }: PreloadedRepliesProps) {
  // This will suspend until the images are loaded
  use(preloadImages(data))

  return (
    <>
      {data.map((e) => (
        <Thread
          key={e.post.id}
          user={e.user}
          post={e.post}
          currentUser={currentUser}
          isCurrentUser={e.user.username === currentUser?.username}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </>
  )
}
