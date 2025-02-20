'use client'

import type { User } from 'lucia'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { FunctionComponent } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { footerLinks } from '@/lib/constants/navigation'

// Common styles for navigation items
const navItemBaseStyles = 'group relative flex size-full items-center justify-center'
const navIconWrapperStyles = 'z-10 transition duration-200 group-active:scale-90'
const navIconStyles = 'size-[26px]'
const navItemHoverBgStyles =
  'absolute z-0 flex size-[90%] scale-80 items-center justify-center rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-white/[0.027] group-active:scale-90'

type MobileSidebarProps = {
  user: User | null
}

const MobileSidebar: FunctionComponent<MobileSidebarProps> = ({ user }) => {
  const pathname = usePathname()
  const { openModal } = useModal()
  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return null
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-0 z-20 flex h-mobile-nav-height w-screen items-center justify-evenly text-navigation-icon md:hidden [&>*:last-child]:mr-1.5 [&>*:nth-child(2)]:ml-1.5"
    >
      <div className="pointer-events-none fixed bottom-0 h-[102px] w-full bg-[rgba(16,16,16,.9)] backdrop-blur-2xl mask-gradient"></div>
      {footerLinks.map((link) => {
        const isActive = pathname === link.route || (pathname.includes(link.route) && link.route.length > 1)
        const activeStyles = isActive ? 'text-primary-text' : ''

        if (link.route === '/create-thread') {
          return (
            <button
              type="button"
              key={link.label}
              className={`${navItemBaseStyles} ${activeStyles}`}
              onClick={() => (user ? openModal('new-thread') : openModal('auth-prompt', 'post'))}
            >
              <div className={navIconWrapperStyles}>
                {link.icon && <link.icon isActive={isActive} className={navIconStyles} />}
              </div>
              <div className={navItemHoverBgStyles}></div>
            </button>
          )
        }

        if (link.route === '/activity' && !user) {
          return (
            <button
              key={link.label}
              type="button"
              onClick={() => openModal('auth-prompt', 'activity')}
              className={`${navItemBaseStyles} ${activeStyles}`}
            >
              <div className={navIconWrapperStyles}>
                {link.icon && <link.icon isActive={isActive} className={navIconStyles} />}
              </div>
              <div className={navItemHoverBgStyles}></div>
            </button>
          )
        }

        if (link.route === '/profile') {
          if (!user) {
            return (
              <button
                key={link.label}
                type="button"
                onClick={() => openModal('auth-prompt', 'profile')}
                className={`${navItemBaseStyles} ${activeStyles}`}
              >
                <div className={navIconWrapperStyles}>
                  {link.icon && <link.icon isActive={isActive} className={navIconStyles} />}
                </div>
                <div className={navItemHoverBgStyles}></div>
              </button>
            )
          }
          return (
            <Link
              key={link.label}
              href={user ? `/profile/@${user.username}` : link.route}
              className={`${navItemBaseStyles} ${activeStyles}`}
            >
              <div className={navIconWrapperStyles}>
                {link.icon && <link.icon isActive={isActive} className={navIconStyles} />}
              </div>
              <div className={navItemHoverBgStyles}></div>
            </Link>
          )
        }
        // Home and Search - no custom logic required, same for auth and non-auth
        return (
          <Link href={link.route} key={link.label} className={`${navItemBaseStyles} ${activeStyles}`}>
            <div className={navIconWrapperStyles}>
              {link.icon && <link.icon isActive={isActive} className={navIconStyles} />}
            </div>
            <div className={navItemHoverBgStyles}></div>
          </Link>
        )
      })}
    </nav>
  )
}

export default MobileSidebar
