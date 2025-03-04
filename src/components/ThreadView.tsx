'use client'

import { useEffect, useRef, useState } from 'react'

import type { Post } from '@/lib/db/Schema'
import type { SessionUser } from '@/lib/Session'
import type { PostUser } from '@/services/users/users.queries'

import ScrollManager from './ScrollManager'
import Thread from './Thread'

type ThreadViewProps = {
  parentThread?: {
    post: Post & { isLiked: boolean; isReposted: boolean }
    user: PostUser
  } | null
  targetThread: {
    post: Post & { isLiked: boolean; isReposted: boolean }
    user: PostUser
  }
  currentUser: SessionUser | null
  isCurrentUser: boolean
  isAuthenticated: boolean
}

export default function ThreadView({
  parentThread,
  targetThread,
  currentUser,
  isCurrentUser,
  isAuthenticated,
}: ThreadViewProps) {
  const [mounted, setMounted] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {mounted && parentThread && (
        <>
          <Thread
            key={parentThread.post.id}
            user={parentThread.user}
            post={parentThread.post}
            currentUser={currentUser}
            isCurrentUser={parentThread.user.username === currentUser?.username}
            isAuthenticated={isAuthenticated}
            isParent
          />
          <div ref={targetRef} />
          <ScrollManager targetRef={targetRef} />
        </>
      )}

      <Thread
        key={targetThread.post.id}
        user={targetThread.user}
        post={targetThread.post}
        currentUser={currentUser}
        isCurrentUser={isCurrentUser}
        isAuthenticated={isAuthenticated}
        isTarget
      />
    </>
  )
}
