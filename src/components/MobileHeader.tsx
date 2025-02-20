import cx from 'clsx'
import { headers } from 'next/headers'
import Link from 'next/link'
import type { FunctionComponent } from 'react'

import { validateRequest } from '@/lib/Lucia'

import BackButton from './BackButton'
import { BackIcon } from './icons'
import Logo from './Logo'
import { MobileSidebarDropdown } from './MobileSidebarDropdown'

const MobileHeader: FunctionComponent = async () => {
  const { user } = await validateRequest()
  const headersList = await headers()
  const referer = headersList.get('referer')
  return (
    <nav
      id="header"
      className={cx(
        'fixed top-0 z-20 grid w-screen grid-cols-[1fr_50vw_1fr] grid-rows-[1fr] bg-primary-bg place-items-center md:hidden md:grid-cols-[1fr_minmax(auto,65%)_1fr]',
        user ? 'h-header-height' : 'h-[74px]',
      )}
    >
      <div className="col-start-1 mr-auto flex h-[52px] w-full items-center justify-start pl-6">
        <BackButton referer={referer}>
          <BackIcon size="md" />
        </BackButton>
      </div>
      <Link href="/" className="col-start-2 flex max-w-8 items-center gap-4">
        <Logo />
      </Link>
      {user && <MobileSidebarDropdown />}
    </nav>
  )
}

export default MobileHeader
