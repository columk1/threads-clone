'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useAppStore } from '@/hooks/useAppStore'

import Spinner from './spinner/Spinner'

type LoadMoreProps = {
  children: React.ReactNode
  initialOffset: number
  loadMoreAction: (offset: number) => Promise<readonly [React.JSX.Element, number | null, any[]]>
}

const LoadMore = ({ children, initialOffset, loadMoreAction }: LoadMoreProps) => {
  const ref = useRef<HTMLButtonElement>(null)
  const [loadMoreNodes, setLoadMoreNodes] = useState<React.JSX.Element[]>([])
  const [disabled, setDisabled] = useState(false)
  const currentOffsetRef = useRef<number | undefined>(initialOffset)
  const [loading, setLoading] = useState(false)
  const addPosts = useAppStore((state) => state.addPosts)

  const loadMore = useCallback(
    async (abortController?: AbortController) => {
      if (!currentOffsetRef.current) {
        return
      }
      setLoading(true)

      loadMoreAction(currentOffsetRef.current)
        .then(([node, next, posts]) => {
          if (abortController?.signal.aborted) {
            return
          }

          // Add the posts directly to the store
          addPosts(posts)
          setLoadMoreNodes((prev) => [...prev, node])

          if (next === null) {
            currentOffsetRef.current = undefined
            setDisabled(true)
            return
          }

          currentOffsetRef.current = next
        })
        .catch((error) => {
          setDisabled(true)
          // eslint-disable-next-line no-console
          console.log('Error loading more posts:', error)
        })
        .finally(() => setLoading(false))
    },
    [loadMoreAction, addPosts],
  )

  useLayoutEffect(() => {
    // Disable browser's scroll restoration behavior
    const { scrollRestoration } = history
    history.scrollRestoration = 'manual'

    return () => {
      history.scrollRestoration = scrollRestoration
      currentOffsetRef.current = initialOffset
    }
  }, [loadMore, initialOffset])

  // useEffect(() => {
  //   //  On mount, load a second section
  //   if (currentOffsetRef.current) {
  //     currentOffsetRef.current = initialOffset
  //     loadMore()
  //   }
  // })

  useEffect(() => {
    const signal = new AbortController()
    const element = ref.current

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && element?.disabled === false) {
          loadMore(signal)
        }
      },
      {
        rootMargin: '200px',
      },
    )

    if (element) {
      observer.observe(element)
    }

    return () => {
      signal.abort()
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [loadMore])

  return (
    <>
      <div className="flex flex-col">
        {children}
        {loadMoreNodes}
      </div>
      <button
        type="button"
        ref={ref}
        disabled={disabled || loading}
        onClick={() => loadMore()}
        className="w-full pb-2 pt-4 text-secondary-text"
      >
        {loading ? <Spinner size={10} /> : disabled ? '' : 'More'}
      </button>
    </>
  )
}

export default LoadMore
