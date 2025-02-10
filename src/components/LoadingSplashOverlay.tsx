/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'

/**
 * LoadingSplashOverlay component displays a full-screen loading overlay with a centered logo
 * that zooms in and fades out after appearing
 * Note: There is a global CSS rule that controls the transition based on the data-threads-loaded attribute
 * @returns ReactElement A full-screen fixed loading screen
 */
export default function LoadingSplashOverlay() {
  const [showOverlay, setShowOverlay] = useState(true)

  if (!showOverlay) {
    return null
  }

  return (
    <div
      className="splash-overlay fixed inset-0 z-50 flex flex-col items-center justify-between bg-gray-0 duration-200"
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
