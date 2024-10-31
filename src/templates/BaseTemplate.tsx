'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { logout } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu'
import CreateIcon from '@/components/icons/Create'
import HomeIcon from '@/components/icons/Home'
import MoreIcon from '@/components/icons/More'
import NotificationsIcon from '@/components/icons/Notifications'
import ProfileIcon from '@/components/icons/Profile'
import SearchIcon from '@/components/icons/Search'
import Logo from '@/components/Logo'
import SidebarDropdown from '@/components/SidebarDropdown'

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

const userId = '01JBAFWPVT21GPF3CWVS2ZH7EH'

export const BaseTemplate = (props: {
  leftNav: React.ReactNode
  rightNav?: React.ReactNode
  children: React.ReactNode
}) => {
  const pathname = usePathname()

  return (
    <div className="h-screen w-full text-gray-6 antialiased">

      <nav className="fixed top-0 z-10 grid h-[60px] w-full grid-cols-[1fr_50vw_1fr] grid-rows-[1fr] place-items-center md:grid-cols-[1fr_minmax(auto,65%)_1fr]">
        <Link href="/" className="col-start-2 flex max-w-8 items-center gap-4 md:hidden">
          <Logo />
        </Link>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="dark:data-[state=open]:text-primary-text md:hidden">
            <div className="ml-auto mr-[13px] flex size-12 items-center justify-center transition duration-200 hover:text-primary-text active:scale-90">
              <MoreIcon orientation="right" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={8} sideOffset={-9} className="w-60 origin-top-right text-[15px] md:hidden">
            <DropdownMenuItem className="leading-none">Settings</DropdownMenuItem>
            <DropdownMenuItem className="leading-none">Saved</DropdownMenuItem>
            <DropdownMenuItem className="leading-none">Liked</DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout}>
              <button type="submit" className="w-full ">
                <DropdownMenuItem className="leading-none text-error-text dark:focus:text-error-text">
                  Log out
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="col-start-2 hidden items-center justify-center text-[15px] font-semibold text-primary-text md:flex">
          <a href="/">For you</a>
        </div>
      </nav>

      <aside className="fixed left-0 top-0 z-10 flex h-full w-[76px] flex-col items-center justify-between overflow-x-visible pb-5 max-md:hidden">
        <Link href="/" className="flex w-[34px] items-center justify-center gap-4 py-[15px]">
          <Logo />
        </Link>
        <div className="flex flex-col gap-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.route
              || (pathname.includes(link.route) && link.route.length > 1)

            if (link.route === '/profile') {
              link.route = `${link.route}/${userId}`
            }

            return (
              <Link
                href={link.route}
                key={link.label}
                className={`relative my-[3px] flex h-[44px] w-[60px] items-center justify-center rounded-lg py-[3px] transition duration-200 hover:bg-active-bg active:scale-85 ${isActive && 'text-primary-text'} ${link?.classNames}`}
              >
                {link.icon && <link.icon />}
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
      <div className="flex h-full flex-col items-center justify-center">
        <main className="mt-[60px] w-full flex-1 md:w-[540px] md:max-w-[540px]">{props.children}</main>
      </div>
    </div>
  )
}
