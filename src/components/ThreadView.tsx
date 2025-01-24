'use client'

import type { User } from 'lucia'
import { useRef } from 'react'

import type { Post } from '@/lib/db/Schema'
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
  currentUser: User | null
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
  const targetRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <ScrollManager targetRef={targetRef} />
      {parentThread ? (
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
          <div ref={targetRef}>
            <Thread
              key={targetThread.post.id}
              user={targetThread.user}
              post={targetThread.post}
              currentUser={currentUser}
              isCurrentUser={isCurrentUser}
              isAuthenticated={isAuthenticated}
              isTarget
            />
          </div>
        </>
      ) : (
        <Thread
          key={targetThread.post.id}
          user={targetThread.user}
          post={targetThread.post}
          currentUser={currentUser}
          isCurrentUser={isCurrentUser}
          isAuthenticated={isAuthenticated}
          isTarget
        />
      )}
    </>
  )
}
