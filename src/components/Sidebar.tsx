'use client'

import type { User } from 'lucia'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { FunctionComponent } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { sidebarLinks } from '@/lib/constants/navigation'

import Logo from './Logo'
import SidebarDropdown from './SidebarDropdown'

type SidebarProps = {
  user: User | null
}

const Sidebar: FunctionComponent<SidebarProps> = ({ user }) => {
  const isAuthenticated = Boolean(user)
  const pathname = usePathname()
  const { openModal } = useModal()
  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (!isDesktop) {
    return null
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed left-0 top-0 z-10 flex h-full w-sidebar-width flex-col items-center justify-between overflow-x-visible pb-5 text-navigation-icon max-md:hidden"
    >
      <Link href="/" className="flex w-[34px] items-center justify-center gap-4 py-[15px]">
        <Logo />
      </Link>
      <div className="flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          const isActive = (route: string) => pathname === link.route || (pathname.includes(route) && route.length > 1)

          if (link.route === '/create-thread') {
            return (
              <button
                type="button"
                key={link.label}
                className={`my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${link?.classNames}`}
                onClick={() => (user ? openModal('new-thread') : openModal('auth-prompt', 'post'))}
              >
                <div className="z-10">{link.icon && <link.icon />}</div>
                <div className="absolute z-0 scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-elevated-bg"></div>
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
                <div className="z-10">{link.icon && <link.icon />}</div>
                <div className="absolute z-0 scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-elevated-bg"></div>
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
                  <div className="z-10">{link.icon && <link.icon />}</div>
                  <div className="absolute z-0 scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-elevated-bg"></div>
                </button>
              )
            }
            return (
              <Link
                href={`/@${user.username}`}
                key={link.label}
                className={`group relative my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${isActive(`/@${user.username}`) && 'text-primary-text'} ${link?.classNames}`}
              >
                <div className="z-10">{link.icon && <link.icon isActive={isActive(`/@${user.username}`)} />}</div>
                <div className="absolute z-0 size-full scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-elevated-bg"></div>
              </Link>
            )
          }

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`group relative my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${isActive(link.route) && 'text-primary-text'} ${link?.classNames}`}
            >
              <div className="z-10">{link.icon && <link.icon isActive={isActive(link.route)} />}</div>
              <div className="absolute z-0 size-full scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-elevated-bg"></div>
            </Link>
          )
        })}
      </div>
      <SidebarDropdown isAuthenticated={isAuthenticated} />
    </nav>
  )
}

export default Sidebar
