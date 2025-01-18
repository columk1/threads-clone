import { notFound } from 'next/navigation'

import HydrateStore from '@/components/hydrateStore'
import Thread from '@/components/Thread'
import { validateRequest } from '@/lib/Lucia'
import { usernameParamSchema } from '@/lib/schemas/zod.schema'
import { getReposts } from '@/services/posts/posts.queries'

export default async function RepostsPage({ params }: { params: Promise<{ username: string }> }) {
  const { user } = await validateRequest()

  const profileParams = await params

  const result = usernameParamSchema.safeParse(profileParams.username)
  if (!result.success) {
    return notFound()
  }
  const username = result.data

  const rows = await getReposts(username)
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
          reposted={row.repost}
        />
      ))}
    </>
  )
}
