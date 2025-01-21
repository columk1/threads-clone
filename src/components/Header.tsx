import { headers } from 'next/headers'
import type { FunctionComponent } from 'react'

import BackButton from './BackButton'
import { BackIcon } from './icons'

type HeaderProps = {
  title: string
  children?: React.ReactNode
}

const Header: FunctionComponent<HeaderProps> = async ({ title, children }) => {
  const headersList = await headers()
  const referer = headersList.get('referer')
  return (
    <>
      {/* Recreate the top outline of the main content to make header fixed/curved over the scrolling content */}
      <div className="sticky top-0 mt-[-60px] hidden h-[60px] w-full md:grid">
        {/* Left corner */}
        <div className="absolute -bottom-12 left-0 size-12 overflow-hidden">
          <div className="absolute inset-0 size-12 rounded-tl-3xl border-l-[0.5px] border-t-[0.5px] border-gray-4 shadow-[0_0_0_48px_var(--secondary-bg)]" />
        </div>
        {/* Right corner */}
        <div className="absolute -bottom-12 right-0 size-12 overflow-hidden">
          <div className="absolute inset-0 size-12 rounded-tr-3xl border-r-[0.5px] border-t-[0.5px] border-gray-4 shadow-[0_0_0_48px_var(--secondary-bg)]" />
        </div>
        {/* Bottom border between squares */}
        <div className="absolute inset-x-12 bottom-[-0.5px] h-[0.5px] bg-gray-4" />
      </div>
      <nav
        id="header"
        className="sticky top-0 z-20 hidden h-[60px] w-full grid-rows-[1fr] place-items-center bg-secondary-bg md:grid md:grid-cols-[1fr_minmax(auto,65%)_1fr]"
      >
        <div className="col-start-1 flex h-[52px] w-full items-center justify-start pl-6">
          <BackButton referer={referer}>
            <BackIcon />
          </BackButton>
        </div>
        <div className="col-start-2 flex items-center justify-center gap-3 text-[15px] font-semibold text-primary-text">
          <a href="/">{title}</a>
          {children}
        </div>
      </nav>
    </>
  )
}

export default Header
