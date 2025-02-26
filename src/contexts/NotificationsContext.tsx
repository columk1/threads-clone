'use client'

import { createContext, type ReactNode, use, useEffect, useMemo, useRef, useState } from 'react'

type NotificationsContextType = {
  unseenCount: number
}

const NotificationsContext = createContext<NotificationsContextType>({
  unseenCount: 0,
})

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = use(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}

export function NotificationsProvider({
  children,
  isAuthenticated,
}: {
  children: ReactNode
  isAuthenticated: boolean
}) {
  const [unseenCount, setUnseenCount] = useState(0)
  const isWindowFocusedRef = useRef(true)
  const intervalIdRef = useRef<NodeJS.Timeout>(null)

  // Create a stable reference to the fetch function
  const fetchCount = useRef(async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      const response = await fetch(`/api/notifications?count=true&unseen=true`)
      if (!response.ok) {
        return
      }

      const data = await response.json()
      if (typeof data.count === 'number') {
        setUnseenCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }).current

  // Function to start polling
  const startPolling = useRef(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
    }

    // Initial fetch when starting polling
    if (unseenCount === 0) {
      fetchCount()
    }

    // Set up new polling interval
    intervalIdRef.current = setInterval(() => {
      if (unseenCount === 0) {
        fetchCount()
      }
    }, 10000)
  }).current

  // Handle window focus events
  useEffect(() => {
    const onFocus = () => {
      isWindowFocusedRef.current = true
      startPolling()
    }

    const onBlur = () => {
      isWindowFocusedRef.current = false
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }

    // Set initial focus state and start polling if focused
    isWindowFocusedRef.current = document.hasFocus()
    if (isWindowFocusedRef.current) {
      startPolling()
    }

    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [startPolling])

  // Reset polling when authentication or unseen count changes
  useEffect(() => {
    if (!isAuthenticated) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
      return
    }

    if (isWindowFocusedRef.current) {
      startPolling()
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [isAuthenticated, unseenCount, startPolling])

  const value = useMemo(
    () => ({
      unseenCount,
    }),
    [unseenCount],
  )

  return <NotificationsContext value={value}>{children}</NotificationsContext>
}

export default NotificationsContext
