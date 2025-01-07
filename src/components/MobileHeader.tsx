import cx from 'clsx'
import type { User } from 'lucia'
import Link from 'next/link'
import type { FunctionComponent } from 'react'

import Logo from './Logo'
import { MobileSidebarDropdown } from './MobileSidebarDropdown'

type MobileHeaderProps = {
  user?: User | null
}

const MobileHeader: FunctionComponent<MobileHeaderProps> = ({ user }) => {
  return (
    <nav
      className={cx(
        'fixed top-0 z-20 grid h-[60px] w-full grid-cols-[1fr_50vw_1fr] grid-rows-[1fr] bg-gray-1 place-items-center md:hidden md:grid-cols-[1fr_minmax(auto,65%)_1fr]',
        user ? 'h-[60px]' : 'h-[74px]',
      )}
    >
      <Link href="/" className="col-start-2 flex max-w-8 items-center gap-4">
        <Logo />
      </Link>
      {user && <MobileSidebarDropdown />}
    </nav>
  )
}

export default MobileHeader
