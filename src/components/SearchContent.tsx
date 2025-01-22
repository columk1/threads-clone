'use client'

import type { User } from 'lucia'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import Avatar from '@/components/Avatar'
import FollowButton from '@/components/FollowButton'
import { SearchIcon } from '@/components/icons'
import Continue from '@/components/icons/Continue'
import { useFollow } from '@/hooks/useFollow'
import type { PostUser } from '@/services/users/users.queries'
import { handleNestedInteraction } from '@/utils/handleNestedInteraction'

import PostAuthor from './PostAuthor'
import Spinner from './spinner/Spinner'

const SearchResult = ({
  user,
  currentUser,
  navigateToProfile,
}: {
  user: PostUser
  currentUser?: User
  navigateToProfile: (username: string) => void
}) => {
  const isCurrentUser = user.id === currentUser?.id
  const { handleToggleFollow } = useFollow({ initialUser: user, isAuthenticated: Boolean(currentUser) })

  return (
    <div
      role="link"
      onClick={(e) => handleNestedInteraction(e, () => navigateToProfile(user.username))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigateToProfile(user.username)
        }
      }}
      tabIndex={0}
      className="flex cursor-pointer gap-3"
    >
      <div className="py-[16px] pl-6">
        <Link href={`/@${user.username}`} tabIndex={-1}>
          <Avatar url={user.avatar} className="mt-0.5" />
        </Link>
      </div>
      <div className="flex w-full border-b-[0.5px] border-primary-outline py-[16px] pr-6">
        <div className="flex flex-1 flex-col">
          <span className="font-semibold leading-5">
            <PostAuthor
              user={user}
              isAuthenticated={Boolean(currentUser)}
              isCurrentUser={isCurrentUser}
              onToggleFollow={handleToggleFollow}
            />
          </span>
          <span className="text-placeholder-text">{user.name}</span>
        </div>
        <div className="w-20">
          {!isCurrentUser && (
            <FollowButton
              isFollowed={user.isFollowed}
              isAuthenticated={Boolean(currentUser)}
              onToggleFollow={handleToggleFollow}
              variant="dark"
            />
          )}
        </div>
      </div>
    </div>
  )
}

const SearchButton = ({ value, onClick }: { value: string; onClick: () => void }) => {
  return (
    <button type="button" className="subtle-focus flex w-full items-center gap-6" onClick={onClick}>
      <div className="py-[16px] pl-6">
        <SearchIcon className="size-[16px] text-gray-6" />
      </div>
      <div className="flex w-full justify-between border-b-[0.5px] border-primary-outline py-[21px] pr-6">
        <div className="font-semibold">{value}</div>
        <Continue className="text-gray-6" />
      </div>
    </button>
  )
}

export default function SearchContent({ currentUser }: { currentUser?: User }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PostUser[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const navigateToProfile = useCallback(
    (username: string) => {
      history.replaceState({ ...history.state, inputValue: searchQuery }, '')
      router.push(`/@${username}`)
    },
    [router, searchQuery],
  )

  const loadHistoryValue = useCallback((node: HTMLInputElement) => {
    const storedState = history.state?.inputValue
    let delayedSelect: NodeJS.Timeout | undefined
    if (storedState) {
      setSearchQuery(storedState)
      delayedSelect = setTimeout(() => {
        node?.select()
      }, 0)
    }
    return () => delayedSelect && clearTimeout(delayedSelect)
  }, [])

  const handleSearchClick = (term: string) => {
    setSearchQuery(term)
    if (!recentSearches.includes(term)) {
      setRecentSearches((prev) => [term, ...prev].slice(0, 5))
    }
  }

  const performSearch = useCallback(async (query: string, signal: AbortSignal) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, { signal })
      const data = await response.json()
      setSearchResults(data.users)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    performSearch(searchQuery, controller.signal)
    return () => controller.abort()
  }, [searchQuery, performSearch])

  return (
    <div className="flex flex-1 flex-col pt-[18px] text-[15px]">
      <div className="px-6 pb-1">
        <div className="relative">
          <SearchIcon className="absolute left-6 top-1/2 size-[16px] -translate-y-1/2 text-gray-6" />
          <input
            ref={loadHistoryValue}
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border-[0.5px] border-gray-5 bg-gray-0 py-3 pl-12 pr-4 placeholder:text-gray-7 hover:border-gray-6 focus:border-gray-6 focus:outline-none"
          />
        </div>
      </div>

      {!searchQuery &&
        recentSearches.map((term) => <SearchButton key={term} value={term} onClick={() => handleSearchClick(term)} />)}

      {isSearching ? (
        <div className="my-auto flex justify-center text-gray-8">
          <Spinner size={10} />
        </div>
      ) : (
        <>
          {searchQuery && <SearchButton value={searchQuery} onClick={() => handleSearchClick(searchQuery)} />}
          {searchResults.map((user) => (
            <SearchResult key={user.id} user={user} currentUser={currentUser} navigateToProfile={navigateToProfile} />
          ))}
        </>
      )}
    </div>
  )
}
