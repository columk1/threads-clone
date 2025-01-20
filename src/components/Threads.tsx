import type { FunctionComponent } from 'react'

import { validateRequest } from '@/lib/Lucia'
import { getFollowingPosts, getPosts, QUERY_LIMIT } from '@/services/posts/posts.queries'

import HydrateStore from './hydrateStore'
import LoadMore from './LoadMore'
import ThreadList from './ThreadList'

type ThreadsProps = {
  filter?: string
}

type PostData = Awaited<ReturnType<typeof getPosts>>
export type PostList = PostData['posts']

async function loadMorePosts(offset: number, filter?: string) {
  'use server'
  const getPostsQuery = filter === undefined ? getPosts : getFollowingPosts
  const { posts, nextOffset } = await getPostsQuery(undefined, offset)
  const { user } = await validateRequest()

  return [<ThreadList key={offset} posts={posts} currentUser={user} filter={filter} />, nextOffset, posts] as const
}

const Threads: FunctionComponent<ThreadsProps> = async ({ filter }) => {
  const { user } = await validateRequest()
  const getPostsQuery = filter === undefined ? getPosts : getFollowingPosts
  const { posts } = await getPostsQuery()

  return (
    <>
      <HydrateStore initialPosts={posts} />
      {posts.length >= QUERY_LIMIT ? (
        <LoadMore loadMoreAction={loadMorePosts} initialOffset={QUERY_LIMIT}>
          <ThreadList posts={posts} currentUser={user} filter={filter} />
        </LoadMore>
      ) : (
        <ThreadList posts={posts} currentUser={user} filter={filter} />
      )}
    </>
  )
}

export default Threads
