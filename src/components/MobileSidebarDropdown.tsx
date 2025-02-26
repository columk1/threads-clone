'use client'

import Link from 'next/link'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu'
import { logout } from '@/services/auth/auth.actions'

import { HamburgerMenuIcon } from './icons'

export const MobileSidebarDropdown = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="ml-auto dark:data-[state=open]:text-primary-text md:hidden">
        <div className="mr-[13px] flex size-12 items-center justify-center text-navigation-icon transition duration-200 hover:text-primary-text active:scale-90">
          <HamburgerMenuIcon orientation="right" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        alignOffset={8}
        sideOffset={-9}
        className="w-60 origin-top-right text-ms md:hidden"
      >
        <DropdownMenuItem asChild className="leading-none">
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="leading-none">
          <Link href="/saved">Saved</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="leading-none">
          <Link href="/liked">Liked</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="leading-none text-error-text dark:focus:text-error-text">
          <button type="button" onClick={logout} className="w-full text-left">
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
