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
import { CaretIcon, CheckmarkIcon, CreateIcon, EditIcon, HomeIcon, MoreIcon, NotificationsFooterIcon, NotificationsIcon, ProfileIcon, SearchIcon } from '@/components/icons'
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
  leftNav: React.ReactNode
  rightNav?: React.ReactNode
  children: React.ReactNode
}) => {
  const pathname = usePathname()

  return (
    <div className="h-screen w-full bg-secondary-bg text-gray-6 antialiased">

      <nav className="fixed top-0 z-10 grid h-[60px] w-full grid-cols-[1fr_50vw_1fr] grid-rows-[1fr] place-items-center md:grid-cols-[1fr_minmax(auto,65%)_1fr]">
        <Link href="/" className="col-start-2 flex max-w-8 items-center gap-4 md:hidden">
          <Logo />
        </Link>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="ml-auto dark:data-[state=open]:text-primary-text md:hidden">
            <div className="mr-[13px] flex size-12 items-center justify-center transition duration-200 hover:text-primary-text active:scale-90">
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
        <div className="col-start-2 hidden items-center justify-center gap-3 text-[15px] font-semibold text-primary-text md:flex">
          <a href="/">For you</a>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="rounded-full dark:data-[state=open]:text-primary-text">
              <div className="flex size-[22px] items-center justify-center rounded-full border-[0.5px] border-gray-5 bg-active-bg transition duration-200 hover:scale-110 hover:text-primary-text active:scale-90">
                <CaretIcon />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent alignOffset={0} sideOffset={6} className="hidden w-60 origin-top text-[15px] md:block">
              <Link href="/">
                <DropdownMenuItem className="cursor-pointer py-3.5">
                  <div className="flex flex-1 items-center justify-between">
                    <span>For you</span>
                    {pathname === '/' && <CheckmarkIcon />}
                  </div>
                </DropdownMenuItem>
              </Link>
              <Link href="/following">
                <DropdownMenuItem className="cursor-pointer py-3.5">
                  <div className="flex flex-1 items-center justify-between">
                    <span>Following</span>
                    {pathname === '/following' && <CheckmarkIcon />}
                  </div>
                </DropdownMenuItem>
              </Link>
              <Link href="/liked">
                <DropdownMenuItem className="py-3.5">
                  <div className="flex flex-1 items-center justify-between">
                    <span>Liked</span>
                    {pathname === '/liked' && <CheckmarkIcon />}
                  </div>
                </DropdownMenuItem>
              </Link>
              <Link href="/saved">
                <DropdownMenuItem className="py-3.5">
                  <div className="flex flex-1 items-center justify-between">
                    <span>Saved</span>
                    {pathname === '/saved' && <CheckmarkIcon />}
                  </div>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

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

      <div className="flex h-full flex-col items-center justify-center px-5">
        <main className="mt-[60px] w-full flex-1 md:w-full md:max-w-[min(calc(100%-(1.5*var(--sidebar-width))),640px)]">{props.children}</main>
      </div>
    </div>
  )
}
