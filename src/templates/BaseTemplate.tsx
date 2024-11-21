import cx from 'clsx'
import type { User } from 'lucia'
import Link from 'next/link'

import Logo from '@/components/Logo'
import MobileSidebar from '@/components/MobileSidebar'
import { MobileSidebarDropdown } from '@/components/MobileSidebarDropdown'
import Sidebar from '@/components/Sidebar'

export const BaseTemplate = ({ user, children }: {
  user: User | null
  children: React.ReactNode
}) => {
  user = null

  return (
    <div className="w-full flex-1 bg-secondary-bg text-gray-6 antialiased">
      {/* Mobile Header */}
      <nav className={cx('fixed top-0 z-10 grid h-[60px] w-full grid-cols-[1fr_50vw_1fr] grid-rows-[1fr] place-items-center md:hidden md:grid-cols-[1fr_minmax(auto,65%)_1fr]', user ? 'h-[60px]' : 'h-[74px]')}>
        <Link href="/" className="col-start-2 flex max-w-8 items-center gap-4">
          <Logo />
        </Link>
        {user
          ? <MobileSidebarDropdown />
          : <Link href="/login" className="ml-auto mr-[19px] flex h-[34px] items-center justify-center rounded-lg border border-gray-5 bg-white px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30">Log in</Link>}
      </nav>

      <Sidebar user={user} />
      <MobileSidebar user={user} />

      <div className="flex min-h-screen flex-col items-center justify-center md:px-5">
        <main className="flex w-full flex-1 flex-col text-primary-text max-md:mt-[60px] md:w-full md:max-w-[min(calc(100%-(1.5*var(--sidebar-width))),640px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
