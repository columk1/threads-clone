import type { User } from 'lucia'
import type { FunctionComponent } from 'react'

import { validateRequest } from '@/lib/Lucia'
import { getFollowingPosts, getPosts, QUERY_LIMIT } from '@/services/posts/posts.queries'

import HydrateStore from './hydrateStore'
import LoadMore from './LoadMore'
import Thread from './Thread'

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
  // const getPostsQuery = () => {
  //   throw new Promise(() => {})
  // }
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
    </>
  )
}

export default Threads
