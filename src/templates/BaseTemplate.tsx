'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useContext } from 'react'

import { logout } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu'
import { CreateIcon, EditIcon, HamburgerMenuIcon, HomeIcon, NotificationsFooterIcon, NotificationsIcon, ProfileIcon, SearchIcon } from '@/components/icons'
import Logo from '@/components/Logo'
import NewThreadModal from '@/components/NewThreadModal'
import SidebarDropdown from '@/components/SidebarDropdown'
import { ModalContext } from '@/context/ModalContext'

const sidebarLinks = [
  {
    icon: HomeIcon,
    route: '/',
    label: 'Home',
  },
  {
    icon: SearchIcon,
    route: '/search',
    label: 'Search',
  },
  {
    icon: CreateIcon,
    route: '/create-thread',
    label: 'Create Thread',
    classNames: 'bg-active-bg text-gray-7 hover:text-primary-text',
  },
  {
    icon: NotificationsIcon,
    route: '/activity',
    label: 'Notifications',
  },
  {
    icon: ProfileIcon,
    route: '/profile',
    label: 'Profile',
  },
]

const footerLinks = sidebarLinks.map((link) => {
  if (link.icon === CreateIcon) {
    return { ...link, icon: EditIcon }
  }
  if (link.icon === NotificationsIcon) {
    return { ...link, icon: NotificationsFooterIcon }
  }
  return link
})

// const userId = '01JBAFWPVT21GPF3CWVS2ZH7EH'

export const BaseTemplate = (props: {
  children: React.ReactNode
}) => {
  const pathname = usePathname()
  const { setIsOpen } = useContext(ModalContext)

  return (
    <div className="w-full flex-1 bg-secondary-bg text-gray-6 antialiased">
      {/* Mobile Header */}
      <nav className="fixed top-0 z-10 grid h-[60px] w-full grid-cols-[1fr_50vw_1fr] grid-rows-[1fr] place-items-center md:hidden md:grid-cols-[1fr_minmax(auto,65%)_1fr]">
        <Link href="/" className="col-start-2 flex max-w-8 items-center gap-4">
          <Logo />
        </Link>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="ml-auto dark:data-[state=open]:text-primary-text md:hidden">
            <div className="mr-[13px] flex size-12 items-center justify-center transition duration-200 hover:text-primary-text active:scale-90">
              <HamburgerMenuIcon orientation="right" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={8} sideOffset={-9} className="w-60 origin-top-right text-[15px] md:hidden">
            <DropdownMenuItem asChild className="leading-none"><Link href="/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="leading-none"><Link href="/saved">Saved</Link></DropdownMenuItem>
            <DropdownMenuItem asChild className="leading-none"><Link href="/liked">Liked</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="leading-none text-error-text dark:focus:text-error-text">
              <button type="button" onClick={logout} className="w-full text-left">
                Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-10 flex h-full w-sidebar-width flex-col items-center justify-between overflow-x-visible pb-5 max-md:hidden">
        <Link href="/" className="flex w-[34px] items-center justify-center gap-4 py-[15px]">
          <Logo />
        </Link>
        <div className="flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.route
              || (pathname.includes(link.route) && link.route.length > 1)

            // if (link.route === '/profile') {
            //   link.route = `${link.route}/${userId}`
            // }
            if (link.route === '/create-thread') {
              return (
                <button
                  type="button"
                  key={link.label}
                  className={`my-[6px] flex h-[48px] w-[60px] items-center justify-center rounded-lg transition duration-200 active:scale-90 ${link?.classNames}`}
                  onClick={() => setIsOpen(true)}
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

        {/* <div className="max-lg:hidden">
                <form action={logout}>
                  <button type="submit" className="border-none text-gray-700 hover:text-gray-900">
                    Sign out
                  </button>
                </form>
              </div> */}
      </aside>

      {/* Mobile footer menu */}
      <aside className="fixed bottom-0 z-10 flex h-[68px] w-full items-center justify-evenly md:hidden">
        {footerLinks.map((link) => {
          const isActive = pathname === link.route
            || (pathname.includes(link.route) && link.route.length > 1)

          // if (link.route === '/profile') {
          //   link.route = `${link.route}/${userId}`
          // }

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`group relative flex w-full items-center justify-center ${isActive && 'text-primary-text'}`}
            >
              <div className="z-10 transition duration-200 group-active:scale-90">
                {link.icon && <link.icon isActive={isActive} className="size-[26px]" />}
              </div>
              <div className="absolute z-0 flex h-[60px] w-full scale-80 items-center justify-center rounded-lg transition duration-200 group-hover:scale-100 group-hover:bg-active-bg group-active:scale-90">
              </div>
            </Link>
          )
        })}
      </aside>

      <div className="flex min-h-screen flex-col items-center justify-center md:px-5">
        <main className="flex w-full flex-1 flex-col text-primary-text max-md:mt-[60px] md:w-full md:max-w-[min(calc(100%-(1.5*var(--sidebar-width))),640px)]">
          {props.children}
          <NewThreadModal />
        </main>
      </div>
    </div>
  )
}
