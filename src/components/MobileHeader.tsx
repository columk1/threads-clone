import cx from 'clsx'
import Link from 'next/link'
import type { FunctionComponent } from 'react'

import { validateRequest } from '@/libs/Lucia'

import BackButton from './BackButton'
import { BackIcon } from './icons'
import Logo from './Logo'
import { MobileSidebarDropdown } from './MobileSidebarDropdown'

const MobileHeader: FunctionComponent = async () => {
  const { user } = await validateRequest()
  return (
    <nav
      className={cx(
        'fixed top-0 z-20 grid w-full grid-cols-[1fr_50vw_1fr] grid-rows-[1fr] bg-gray-1 place-items-center md:hidden md:grid-cols-[1fr_minmax(auto,65%)_1fr]',
        user ? 'h-[60px]' : 'h-[74px]',
      )}
    >
      <div className="col-start-1 mr-auto flex h-[52px] w-full items-center justify-start pl-6">
        <BackButton>
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
