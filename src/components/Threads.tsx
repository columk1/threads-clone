import type { FunctionComponent } from 'react'

import { validateRequest } from '@/lib/Lucia'
import { getFollowingPosts, getPosts } from '@/services/posts/posts.queries'

import HydrateStore from './hydrateStore'
import Thread from './Thread'

type ThreadsProps = {
  filter?: string
}

const Threads: FunctionComponent<ThreadsProps> = async ({ filter }) => {
  const { user } = await validateRequest()
  const getPostsQuery = filter === undefined ? getPosts : getFollowingPosts
  const rows = await getPostsQuery()
  // const rows: PostsResponse
  //   = await fetch(`${BASE_URL}/api/posts?user=${user?.id}${filter ? `&filter=${filter}` : ''}`, { next: { revalidate: 60, tags: ['posts'] } })
  //     .then(res => res.json())

  return (
    <>
      <HydrateStore initialPosts={rows} />
      {rows.map((row) => (
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

export default Threads
