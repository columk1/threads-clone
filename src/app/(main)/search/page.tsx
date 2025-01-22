import type { User } from 'lucia'
import { Suspense } from 'react'

import Header from '@/components/Header'
import SearchAutocomplete from '@/components/SearchAutocomplete'
import Skeleton from '@/components/Skeleton'
import Thread from '@/components/Thread'
import { validateRequest } from '@/lib/Lucia'
import { searchPosts } from '@/services/posts/posts.queries'

export const metadata = {
  title: 'Search',
}

const SearchResults = async ({ query, user }: { query: string; user: User | null }) => {
  const { posts } = await searchPosts(query)

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

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { user } = await validateRequest()
  const searchQuery = (await searchParams).q
  if (typeof searchQuery !== 'string') {
    return (
      <>
        <Header title="Search" />
        <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
          <SearchAutocomplete currentUser={user || undefined} />
        </div>
      </>
    )
  }
  return (
    <>
      <Header title={searchQuery} />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <Suspense fallback={<Skeleton />}>
          <SearchResults query={searchQuery} user={user} />
        </Suspense>
      </div>
    </>
  )
}
