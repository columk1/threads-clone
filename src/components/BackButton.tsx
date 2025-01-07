'use client'

import { useRouter } from 'next/navigation'
import type { FunctionComponent } from 'react'

type BackButtonProps = {
  children: React.ReactNode
}

const BackButton: FunctionComponent<BackButtonProps> = ({ children }) => {
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
      className="rounded-full p-1.5 transition active:scale-85 max-md:animate-in max-md:fade-in-0 max-md:slide-in-from-left-12 max-md:[animation-duration:_250ms] md:border-[0.5px] md:border-gray-5 md:bg-gray-2"
    >
      {/* Icon supplied as children */}
      {children}
    </button>
  )
}

export default BackButton
