/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'

/**
 * LoadingSplashOverlay component displays a full-screen loading overlay with a centered logo
 * that zooms in and fades out after appearing.
 *
 * The overlay will fade out either:
 * 1. When the threads-loaded attribute is set (for browsers supporting :has)
 * 2. After a maximum timeout of 2 seconds (fallback for browsers not supporting :has)
 *
 * @returns ReactElement A full-screen fixed loading screen
 */
export default function LoadingSplashOverlay() {
  const [showOverlay, setShowOverlay] = useState(true)

  // Callback ref that sets up the fallback timeout
  const overlayRef = (node: HTMLDivElement) => {
    // Set a timeout to hide the overlay after 2 seconds
    const timeoutId = setTimeout(() => {
      node?.classList.add('opacity-0', 'scale-125')
    }, 1500)

    return () => clearTimeout(timeoutId)
  }

  if (!showOverlay) {
    return null
  }

  return (
    <div
      ref={overlayRef}
      className="splash-overlay fixed inset-0 z-50 flex flex-col items-center justify-between bg-secondary-bg duration-200"
      role="progressbar"
      aria-busy="true"
      aria-label="Loading"
      onTransitionEnd={() => setShowOverlay(false)}
    >
      <div className="flex flex-1 flex-col justify-between py-6">
        <div />
        <div className="size-[90px]">
          <img src="/assets/images/logo.svg" alt="Threads Logo" className="splash-logo" />
        </div>
        <div className="flex items-center">
          <img src="/assets/images/splash.svg" alt="From Meta" />
          {/* <Github />
          <span>columk</span> */}
        </div>
      </div>
    </div>
  )
}
