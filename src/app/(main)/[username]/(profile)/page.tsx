import { notFound } from 'next/navigation'

import { getAllPosts } from '@/app/actions'
import Thread from '@/components/Thread'
import { validateRequest } from '@/libs/Lucia'
import { usernameParamSchema } from '@/models/zod.schema'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'

export default async function UserProfilePage(params: Promise<{ username: string }>) {
  const { user } = await validateRequest()

  const profileParams = await params

  const result = usernameParamSchema.safeParse(profileParams.username)
  if (!result.success) {
    notFound()
  }
  const username = result.data

  const rows = await getAllPosts(username)

  return rows.map(row => (
    <Thread
      key={row.post.id}
      post={row.post}
      user={row.user}
      isAuthenticated={!!user}
      isCurrentUser={user ? row.user.username === user.username : false}
    />
  ))
}
