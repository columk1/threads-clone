import { notFound } from 'next/navigation'

import HydrateStore from '@/components/HydrateStore'
import Thread from '@/components/Thread'
import { validateRequest } from '@/lib/Lucia'
import { usernameParamSchema } from '@/lib/schemas/zod.schema'
import { getPosts } from '@/services/posts/posts.queries'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

export default async function UserProfileThreads({ params }: { params: Promise<{ username: string }> }) {
  const { user } = await validateRequest()

  const profileParams = await params

  const result = usernameParamSchema.safeParse(profileParams.username)
  if (!result.success) {
    return notFound()
  }
  const username = result.data

  const { posts: initialPosts } = await getPosts(username, 0)

  return (
    <>
      <HydrateStore initialPosts={initialPosts} />
      {initialPosts.map((row) => (
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
