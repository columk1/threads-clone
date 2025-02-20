'use client'

import cx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type FunctionComponent, useEffect, useState } from 'react'

type BackButtonUiProps = {
  referer: string | null
  children: React.ReactNode
}

const BackButtonUi: FunctionComponent<BackButtonUiProps> = ({ referer, children }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const hasQuery = useSearchParams().get('q')
  const showBackButton = isAnimating || pathname.includes('@') || hasQuery

  const handleBack = () => {
    setIsAnimating(true)

    if (!referer) {
      router.push('/')
      return
    }

    try {
      const refererUrl = new URL(referer)
      router[refererUrl.hostname === window.location.hostname ? 'back' : 'push']('/')
    } catch {
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
        ' rounded-full p-1.5 transition active:scale-85 max-md:animate-in max-md:fade-in-0 max-md:slide-in-from-left-12 max-md:[animation-duration:_250ms] md:border-[0.5px] md:border-primary-outline md:bg-elevated-bg',
      )}
    >
      {/* Icon supplied as children */}
      {children}
    </button>
  )
}

export default BackButtonUi
