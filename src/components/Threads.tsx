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

// const rows: PostsResponse
//   = await fetch(`${BASE_URL}/api/posts?user=${user?.id}${filter ? `&filter=${filter}` : ''}`, { next: { revalidate: 60, tags: ['posts'] } })
//     .then(res => res.json())

const ThreadList = ({ posts, currentUser }: { posts: PostList; currentUser: User | null }) => {
  return (
    <>
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
    </>
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
  const { user } = await validateRequest()
  const getPostsQuery = filter === undefined ? getPosts : getFollowingPosts
  const { posts } = await getPostsQuery()

  return (
    <>
      <HydrateStore initialPosts={posts} />
      {posts.length >= QUERY_LIMIT ? (
        <LoadMore loadMoreAction={loadMorePosts} initialOffset={QUERY_LIMIT}>
          <ThreadList posts={posts} currentUser={user} />
        </LoadMore>
      ) : (
        <ThreadList posts={posts} currentUser={user} />
      )}
    </>
  )
}

export default Threads
