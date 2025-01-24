'use client'

import { type RefObject, useEffect } from 'react'

type ScrollManagerProps = {
  targetRef: RefObject<HTMLDivElement | null>
}

// If there is a parent thread, this will scroll so it's out of view above the post
export default function ScrollManager({ targetRef }: ScrollManagerProps) {
  useEffect(() => {
    const targetThread = targetRef?.current
    // Return to the top of the post if there's no parent/target
    if (!targetThread) {
      return window.scrollTo({
        top: 0,
        behavior: 'instant',
      })
    }
    const header = document.getElementById('header')
    const headerOffset = header ? Number.parseInt(window.getComputedStyle(header).height, 10) : 60
    const elementPosition = targetThread.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - headerOffset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'instant',
    })
  }, [targetRef])
  return null
}
