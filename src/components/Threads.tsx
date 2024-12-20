import type { FunctionComponent } from 'react'

import type { PostsResponse } from '@/app/api/posts/route'
import { BASE_URL } from '@/constants/baseURL'
import { validateRequest } from '@/libs/Lucia'

import HydrateStore from './hydrateStore'
import Thread from './Thread'

type ThreadsProps = {
  filter?: string
}

const Threads: FunctionComponent<ThreadsProps> = async ({ filter }) => {
  const { user } = await validateRequest()
  const rows: PostsResponse
    = await fetch(`${BASE_URL}/api/posts?user=${user?.id}${filter ? `&filter=${filter}` : ''}`, { next: { revalidate: 60, tags: ['posts'] } })
      .then(res => res.json())

  return (
    <>
      <HydrateStore initialPosts={rows} />
      {rows.map(row => (
        <Thread
          key={row.post.id}
          post={row.post}
          user={row.user}
          isAuthenticated={!!user}
          isCurrentUser={user ? row.user.username === user.username : false}
        />
      ))}
    </>
  )
}

export default Threads
