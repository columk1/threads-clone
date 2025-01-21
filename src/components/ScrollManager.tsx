'use client'

import { useEffect } from 'react'

export default function ScrollManager() {
  useEffect(() => {
    const targetThread = document.getElementById('target-thread')
    const header = document.getElementById('header')
    if (targetThread) {
      const headerOffset = header ? Number.parseInt(window.getComputedStyle(header).height, 10) : 60
      const elementPosition = targetThread.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'instant',
      })
    }
  }, [])
  return null
}
