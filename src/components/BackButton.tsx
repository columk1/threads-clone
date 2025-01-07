'use client'

import cx from 'clsx'
import { usePathname, useRouter } from 'next/navigation'
import { type FunctionComponent, useEffect, useState } from 'react'

type BackButtonProps = {
  children: React.ReactNode
}

const BackButton: FunctionComponent<BackButtonProps> = ({ children }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const showBackButton = isAnimating || pathname.includes('@')

  const handleBack = () => {
    setIsAnimating(true)
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

  useEffect(() => {
    if (!isAnimating) {
      return
    }
    // Remove the button from the view when the animation is done
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [isAnimating])

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cx(
        !showBackButton && 'hidden',
        isAnimating && 'max-md:animate-out max-md:fade-out max-md:slide-out-to-left-12',
        'text-primary-text rounded-full p-1.5 transition active:scale-85 max-md:animate-in max-md:fade-in-0 max-md:slide-in-from-left-12 max-md:[animation-duration:_250ms] md:border-[0.5px] md:border-gray-5 md:bg-gray-2',
      )}
    >
      {/* Icon supplied as children */}
      {children}
    </button>
  )
}

export default BackButton
