'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { FunctionComponent } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { sidebarLinks } from '@/lib/constants/navigation'
import type { SessionUser } from '@/lib/Session'

import Logo from './Logo'
import SidebarDropdown from './SidebarDropdown'

// Common styles for navigation items
const navItemBaseStyles =
  'group relative my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90'
const navIconWrapperStyles = 'z-10'
const navItemHoverBgStyles =
  'absolute z-0 size-full scale-80 rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-elevated-bg'

type SidebarProps = {
  user: SessionUser | null
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
      <div className="py-[15px]">
        <Link href="/" className="flex w-[34px] items-center justify-center gap-4">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        {sidebarLinks.map((link) => {
          const isActive = (route: string) => pathname === link.route || (pathname.includes(route) && route.length > 1)

          if (link.route === '/create-thread') {
            return (
              <button
                type="button"
                key={link.label}
                className={`${navItemBaseStyles} ${link?.classNames}`}
                onClick={() => (user ? openModal('new-thread') : openModal('auth-prompt', 'post'))}
              >
                <div className={navIconWrapperStyles}>{link.icon && <link.icon />}</div>
                <div className={navItemHoverBgStyles}></div>
              </button>
            )
          }

          if (link.route === '/activity' && !user) {
            return (
              <button
                type="button"
                key={link.label}
                className={`${navItemBaseStyles} ${link?.classNames}`}
                onClick={() => openModal('auth-prompt', 'activity')}
              >
                <div className={navIconWrapperStyles}>{link.icon && <link.icon />}</div>
                <div className={navItemHoverBgStyles}></div>
              </button>
            )
          }

          if (link.route === '/profile') {
            if (!user) {
              return (
                <button
                  type="button"
                  key={link.label}
                  className={`${navItemBaseStyles} ${link?.classNames}`}
                  onClick={() => openModal('auth-prompt', 'profile')}
                >
                  <div className={navIconWrapperStyles}>{link.icon && <link.icon />}</div>
                  <div className={navItemHoverBgStyles}></div>
                </button>
              )
            }
            return (
              <Link
                href={`/@${user.username}`}
                key={link.label}
                className={`${navItemBaseStyles} ${isActive(`/@${user.username}`) && 'text-primary-text'} ${link?.classNames}`}
              >
                <div className={navIconWrapperStyles}>
                  {link.icon && <link.icon isActive={isActive(`/@${user.username}`)} />}
                </div>
                <div className={navItemHoverBgStyles}></div>
              </Link>
            )
          }
          // Home and Search - no custom logic required, same for auth and non-auth
          return (
            <Link
              href={link.route}
              key={link.label}
              className={`${navItemBaseStyles} ${isActive(link.route) && 'text-primary-text'} ${link?.classNames}`}
            >
              <div className={navIconWrapperStyles}>{link.icon && <link.icon isActive={isActive(link.route)} />}</div>
              <div className={navItemHoverBgStyles}></div>
            </Link>
          )
        })}
      </div>
      <SidebarDropdown isAuthenticated={isAuthenticated} />
    </nav>
  )
}

export default Sidebar
