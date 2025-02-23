'use client'

import { type RefObject, useLayoutEffect } from 'react'

type ScrollManagerProps = {
  targetRef: RefObject<HTMLDivElement | null>
}

// If there is a parent thread, this will scroll so it's out of view above the post
export default function ScrollManager({ targetRef }: ScrollManagerProps) {
  useLayoutEffect(() => {
    const scrollTarget = targetRef?.current
    if (!scrollTarget) {
      return
    }
    // Get the height of the header to offset the scroll position
    // A little brittle but it gets the current visible header height, which depends on both screen-width and auth state
    const visibleHeader = Array.from(document.querySelectorAll('[role="banner"]')).find(
      (header) => window.getComputedStyle(header).display !== 'none',
    )

    const headerOffset = visibleHeader ? visibleHeader.clientHeight : 60
    const elementPosition = scrollTarget.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'instant',
    })
  }, [targetRef])
  return null
}
