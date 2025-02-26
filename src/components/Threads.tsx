import type { User } from 'lucia'
import type { FunctionComponent } from 'react'

import HydrateStore from '@/components/HydrateStore'
import LoadMore from '@/components/LoadMore'
import Thread from '@/components/Thread'
import { validateRequest } from '@/lib/Lucia'
import { getFollowingPosts, getPosts, QUERY_LIMIT } from '@/services/posts/posts.queries'

import Delay from './Delay'

type ThreadsProps = {
  filter?: string
}

type PostData = Awaited<ReturnType<typeof getPosts>>
export type PostList = PostData['posts']

export type ThreadListProps = {
  posts: PostList
  currentUser: User | null
}

const ThreadList = ({ posts, currentUser }: ThreadListProps) => {
  return (
    <div role="list" data-threads-loaded="true">
      {posts.map((row, index) => (
        <Thread
          key={row.post.id}
          post={row.post}
          user={row.user}
          currentUser={currentUser}
          isAuthenticated={!!currentUser}
          isCurrentUser={currentUser ? row.user.username === currentUser.username : false}
          imagePriority={index < 5}
        />
      ))}
    </div>
  )
}

async function loadMorePosts(offset: number, filter?: string) {
  'use server'
  const getPostsQuery = filter === undefined ? getPosts : getFollowingPosts
  const { posts, nextOffset } = await getPostsQuery(undefined, offset)
  const { user } = await validateRequest()

  return [<ThreadList key={offset} posts={posts} currentUser={user} />, nextOffset, posts] as const
}

const Threads: FunctionComponent<ThreadsProps> = async ({ filter }) => {
  const { user: currentUser } = await validateRequest()
  const getPostsQuery = filter === undefined ? getPosts : getFollowingPosts
  const { posts } = await getPostsQuery()

  return (
    <>
      <HydrateStore initialPosts={posts} />
      {posts.length >= QUERY_LIMIT ? (
        <LoadMore loadMoreAction={loadMorePosts} initialOffset={QUERY_LIMIT}>
          <ThreadList posts={posts} currentUser={currentUser} />
        </LoadMore>
      ) : (
        <ThreadList posts={posts} currentUser={currentUser} />
      )}
      {/* Add a delay to keep displaying the parent's fallback while images load */}
      {/* TODO: replace with preload-images component */}
      <Delay delay={1500} />
    </>
  )
}

export default Threads
