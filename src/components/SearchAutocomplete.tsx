'use client'

import type { User } from 'lucia'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import Avatar from '@/components/Avatar'
import FollowButton from '@/components/FollowButton'
import { SearchIcon } from '@/components/icons'
import Continue from '@/components/icons/Continue'
import PostAuthor from '@/components/PostAuthor'
import Spinner from '@/components/Spinner/Spinner'
import UnfollowModal from '@/components/UnfollowModal'
import { useSearch } from '@/contexts/SearchContext'
import { useAppStore } from '@/hooks/useAppStore'
import { useFollow } from '@/hooks/useFollow'
import type { PostUser } from '@/services/users/users.queries'
import { handleNestedInteraction } from '@/utils/handleNestedInteraction'

// Autocomplete search results (user cards)

const SearchResult = ({
  user: initialUser,
  currentUser,
  navigate,
}: {
  user: PostUser
  currentUser?: User
  navigate: () => void
}) => {
  const isCurrentUser = initialUser.id === currentUser?.id
  const storedUser = useAppStore((state) => state.users[initialUser.id])
  const user = {
    ...initialUser,
    ...(storedUser && {
      isFollowed: storedUser.isFollowed,
      followerCount: storedUser.followerCount,
    }),
  }
  const { handleToggleFollow, unfollowModalProps } = useFollow({
    initialUser: user,
    isAuthenticated: Boolean(currentUser),
  })

  return (
    <div
      role="link"
      onClick={(e) => handleNestedInteraction(e, navigate)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate()
        }
      }}
      tabIndex={0}
      className="flex cursor-pointer gap-3"
    >
      <div className="py-[16px] pl-6">
        <button type="button" onClick={() => navigate()} tabIndex={-1}>
          <Avatar url={user.avatar} className="mt-0.5" />
        </button>
      </div>
      <div className="flex w-full border-b-[0.5px] border-primary-outline py-[16px] pr-6">
        <div className="flex flex-1 flex-col">
          <span className="font-semibold leading-5">
            <PostAuthor user={user} isCurrentUser={isCurrentUser} onToggleFollow={handleToggleFollow} />
          </span>
          <span className="text-placeholder-text">{user.name}</span>
        </div>
        <div className="">
          {!isCurrentUser && (
            <>
              <FollowButton
                muted
                isFollowed={user.isFollowed}
                isFollower={user.isFollower}
                onToggleFollow={handleToggleFollow}
              />
              {user.isFollowed && <UnfollowModal {...unfollowModalProps} />}
            </>
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
        <SearchIcon className="size-[16px] text-navigation-icon" />
      </div>
      <div className="flex w-full justify-between border-b-[0.5px] border-primary-outline py-[21px] pr-6">
        <div className="font-semibold">{value}</div>
        <Continue className="text-navigation-icon" />
      </div>
    </button>
  )
}

export default function SearchAutocomplete({ currentUser }: { currentUser?: User }) {
  const { searchHistory, currentQuery, setCurrentQuery, addToHistory } = useSearch()
  const [searchResults, setSearchResults] = useState<PostUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const addUsers = useAppStore(
    (state: { addUsers: (users: Array<{ id: string; isFollowed: boolean; followerCount: number }>) => void }) =>
      state.addUsers,
  )

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmedTerm = currentQuery.trim()
      if (trimmedTerm) {
        addToHistory(trimmedTerm)
        router.push(`/search?q=${encodeURIComponent(trimmedTerm)}`)
      }
    },
    [addToHistory, currentQuery, router],
  )

  const navigateToProfile = useCallback(
    (username: string) => {
      router.push(`/@${username}`)
    },
    [router],
  )

  const performSearch = useCallback(
    async (query: string, signal: AbortSignal) => {
      if (!query.trim()) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, { signal })
        const data = await response.json()
        setSearchResults(data.users)
        addUsers(
          data.users.map((user: PostUser) => ({
            id: user.id,
            isFollowed: user.isFollowed,
            isFollower: user.isFollower,
            followerCount: user.followerCount,
          })),
        )
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [addUsers],
  )

  const selectInput = useCallback((node: HTMLInputElement | null) => {
    node?.select()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    performSearch(currentQuery, controller.signal)
    return () => controller.abort()
  }, [currentQuery, performSearch])

  return (
    <div className="flex flex-1 flex-col pt-5 text-ms">
      <div className="px-6 pb-1">
        <div className="relative">
          <SearchIcon className="absolute left-6 top-1/2 size-[16px] -translate-y-1/2 text-navigation-icon" />
          <form ref={formRef} action="/search" onSubmit={handleSubmit}>
            <input
              ref={selectInput}
              type="text"
              name="q"
              placeholder="Search"
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              className="w-full rounded-2xl border-[0.5px] border-primary-outline bg-secondary-bg py-3 pl-12 pr-4 placeholder:text-secondary-text hover:border-primary-outline focus:border-primary-outline focus:outline-none"
            />
          </form>
        </div>
      </div>
      {/* Show a list of previous queries that can be clicked when input is empty */}
      {!currentQuery &&
        searchHistory.map((term) => (
          <SearchButton
            key={term}
            value={term}
            onClick={() => {
              setCurrentQuery(term)
              handleSubmit()
            }}
          />
        ))}

      {isSearching ? (
        <div className="my-auto flex justify-center text-secondary-text">
          <Spinner size={10} />
        </div>
      ) : (
        <>
          {/* Button to search for posts using the search term followed by a list of users returned by the autocomplete */}
          {currentQuery && <SearchButton value={currentQuery} onClick={handleSubmit} />}
          {searchResults.map((user) => (
            <SearchResult
              key={user.id}
              user={user}
              currentUser={currentUser}
              navigate={() => navigateToProfile(user.username)}
            />
          ))}
        </>
      )}
    </div>
  )
}
