'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type SearchContextType = {
  searchHistory: string[]
  currentQuery: string
  setCurrentQuery: (query: string) => void
  addToHistory: (query: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [currentQuery, setCurrentQuery] = useState('')

  const addToHistory = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim()
      if (trimmedQuery && !searchHistory.includes(trimmedQuery)) {
        setSearchHistory((prev) => {
          const newHistory = [trimmedQuery, ...prev].slice(0, 5)
          return newHistory
        })
      }
    },
    [searchHistory],
  )

  const value = useMemo(
    () => ({
      searchHistory,
      currentQuery,
      setCurrentQuery,
      addToHistory,
    }),
    [searchHistory, currentQuery, addToHistory],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
