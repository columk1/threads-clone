import { notFound } from 'next/navigation'

import { getAllPosts } from '@/app/actions'
import Thread from '@/components/Thread'
import { validateRequest } from '@/libs/Lucia'
import { usernameParamSchema } from '@/models/zod.schema'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { user } = await validateRequest()

  const profileParams = await params

  const result = usernameParamSchema.safeParse(profileParams.username)
  if (!result.success) {
    notFound()
  }
  const username = result.data

  // const rows: PostsResponse
  //   = await fetch(`${BASE_URL}/api/posts?user=${user?.id}&username=${username}`, { next: { revalidate: 60, tags: ['profile'] } })
  //   // = await fetch(`${BASE_URL}/api/posts?user=${user?.id}&username=${username}`)
  //     .then(res => res.json())

  const rows = await getAllPosts(username)

  return rows.map((row) => (
    <Thread
      key={row.post.id}
      post={row.post}
      user={row.user}
      currentUser={user}
      isAuthenticated={!!user}
      isCurrentUser={user ? row.user.username === user.username : false}
    />
  ))
}
