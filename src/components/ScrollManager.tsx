'use client'

import { useLayoutEffect } from 'react'

// If there is a parent thread, this will scroll so it's out of view above the post
export default function ScrollManager() {
  useLayoutEffect(() => {
    const targetThread = document.getElementById('target-thread')
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
  }, [])
  return null
}
