'use client'

import type { User } from 'lucia'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { FunctionComponent } from 'react'

import { sidebarLinks } from '@/constants/navigation'
import { useModal } from '@/hooks/useModal'

import Logo from './Logo'
import SidebarDropdown from './SidebarDropdown'

type SidebarProps = {
  user: User | null
}

const Sidebar: FunctionComponent<SidebarProps> = ({ user }) => {
  const pathname = usePathname()
  const { openModal } = useModal()

  return (
    <aside className="fixed left-0 top-0 z-10 flex h-full w-sidebar-width flex-col items-center justify-between overflow-x-visible pb-5 max-md:hidden">
      <Link href="/" className="flex w-[34px] items-center justify-center gap-4 py-[15px]">
        <Logo />
      </Link>
      <div className="flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.route
            || (pathname.includes(link.route) && link.route.length > 1)

          if (link.route === '/create-thread') {
            return (
              <button
                type="button"
                key={link.label}
                className={`my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${link?.classNames}`}
                onClick={() => user ? openModal('new-thread') : openModal('auth-prompt', 'post')}
              >
                <div className="z-10">
                  {link.icon && <link.icon />}
                </div>
                <div className="absolute z-0 scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-active-bg">
                </div>
              </button>
            )
          }

          if (link.route === '/activity' && !user) {
            return (
              <button
                type="button"
                key={link.label}
                className={`my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${link?.classNames}`}
                onClick={() => openModal('auth-prompt', 'activity')}
              >
                <div className="z-10">
                  {link.icon && <link.icon />}
                </div>
                <div className="absolute z-0 scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-active-bg">
                </div>
              </button>
            )
          }

          if (link.route === '/profile') {
            if (!user) {
              return (
                <button
                  type="button"
                  key={link.label}
                  className={`my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${link?.classNames}`}
                  onClick={() => openModal('auth-prompt', 'profile')}
                >
                  <div className="z-10">
                    {link.icon && <link.icon />}
                  </div>
                  <div className="absolute z-0 scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-active-bg">
                  </div>
                </button>
              )
            }
            return (
              <Link
                href={`/@${user.username}`}
                key={link.label}
                className={`group relative my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${isActive && 'text-primary-text'} ${link?.classNames}`}
              >
                <div className="z-10">
                  {link.icon && <link.icon isActive={isActive} />}
                </div>
                <div className="absolute z-0 size-full scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-active-bg">
                </div>
              </Link>
            )
          }

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`group relative my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${isActive && 'text-primary-text'} ${link?.classNames}`}
            >
              <div className="z-10">
                {link.icon && <link.icon isActive={isActive} />}
              </div>
              <div className="absolute z-0 size-full scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-active-bg">
              </div>
            </Link>
          )
        })}
      </div>
      <SidebarDropdown />
    </aside>
  )
}

export default Sidebar
