'use client'

import { useRouter } from 'next/navigation'
import type { FunctionComponent } from 'react'

import { BackIcon } from './icons'

const BackButton: FunctionComponent = () => {
  const router = useRouter()

  const handleBack = () => {
    try {
      const referrerUrl = new URL(document.referrer)
      if (referrerUrl.hostname === window.location.hostname) {
        router.back()
      } else {
        router.push('/')
      }
    } catch {
      // If referrer is empty or invalid URL
      router.push('/')
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="ml-6 rounded-full border-[0.5px] border-gray-5 bg-active-bg p-1.5"
    >
      <BackIcon />
    </button>
  )
}

export default BackButton
