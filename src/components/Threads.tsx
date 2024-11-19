import type { FunctionComponent } from 'react'

import { getAllPosts, getFollowingPosts } from '@/app/actions'
import { validateRequest } from '@/libs/Lucia'

import Thread from './Thread'

type ThreadsProps = {
  filter?: string
}

const Threads: FunctionComponent<ThreadsProps> = async ({ filter }) => {
  const { user } = await validateRequest()
  const rows = filter === undefined ? await getAllPosts() : await getFollowingPosts()

  return rows.map(row => (
    <Thread
      key={row.post.id}
      post={row.post}
      user={row.user}
      isCurrentUser={user ? row.user.username === user.username : false}
    />
  ))
}

export default Threads
