import type { User } from 'lucia'
import { Suspense } from 'react'

import { ContentPane } from '@/components/ContentPane'
import Header from '@/components/Header'
import HydrateStore from '@/components/HydrateStore'
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

  return posts.length > 0 ? (
    <>
      <HydrateStore initialPosts={posts} />
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
  ) : (
    <div className="mx-auto py-3 text-secondary-text">No results</div>
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
        <ContentPane>
          <SearchAutocomplete currentUser={user || undefined} />
        </ContentPane>
      </>
    )
  }
  return (
    <>
      <Header title={searchQuery} />
      <ContentPane>
        <Suspense fallback={<Skeleton />}>
          <SearchResults query={searchQuery} user={user} />
        </Suspense>
      </ContentPane>
    </>
  )
}
