import type { FunctionComponent } from 'react'

import { validateRequest } from '@/lib/Lucia'
import { getFollowingPosts, getPosts, QUERY_LIMIT } from '@/services/posts/posts.queries'

import HydrateStore from './hydrateStore'
import LoadMore from './LoadMore'
import Thread from './Thread'

type ThreadsProps = {
  filter?: string
}

// const rows: PostsResponse
//   = await fetch(`${BASE_URL}/api/posts?user=${user?.id}${filter ? `&filter=${filter}` : ''}`, { next: { revalidate: 60, tags: ['posts'] } })
//     .then(res => res.json())

type PostData = Awaited<ReturnType<typeof getPosts>>
export type PostList = PostData['posts']

const ThreadList = ({ posts, user }: { posts: PostList; user: any }) => {
  return (
    <>
      {posts.map((row) => (
        <Thread
          key={row.post.id}
          post={row.post}
          user={row.user}
          currentUser={user}
          isAuthenticated={!!user}
          isCurrentUser={user ? row.user.username === user.username : false}
        />
      ))}
    </>
  )
}

async function loadMorePosts(offset: number, filter?: string) {
  'use server'
  const getPostsQuery = filter === undefined ? getPosts : getFollowingPosts
  const { posts, nextOffset } = await getPostsQuery(undefined, offset)
  const { user } = await validateRequest()

  return [<ThreadList key={offset} posts={posts} user={user} />, nextOffset, posts] as const
}

const Threads: FunctionComponent<ThreadsProps> = async ({ filter }) => {
  const { user } = await validateRequest()
  const getPostsQuery = filter === undefined ? getPosts : getFollowingPosts
  const { posts } = await getPostsQuery()

  return (
    <>
      <HydrateStore initialPosts={posts} />
      {posts.length > QUERY_LIMIT ? (
        <LoadMore loadMoreAction={loadMorePosts} initialOffset={QUERY_LIMIT}>
          <ThreadList posts={posts} user={user} />
        </LoadMore>
      ) : (
        <ThreadList posts={posts} user={user} />
      )}
    </>
  )
}

export default Threads
