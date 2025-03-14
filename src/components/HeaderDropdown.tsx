import Link from 'next/link'
import type { FunctionComponent } from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/DropdownMenu'

import { CaretIcon, CheckmarkIcon } from './icons'

type HeaderDropdownProps = {
  pathname: string
}

export const HeaderDropdown: FunctionComponent<HeaderDropdownProps> = ({ pathname }) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="rounded-full dark:data-[state=open]:text-primary-text">
        <div className="flex size-[22px] items-center justify-center rounded-full border-[0.5px] border-primary-outline bg-elevated-bg transition duration-200 hover:scale-110 hover:text-primary-text active:scale-90">
          <CaretIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent alignOffset={0} sideOffset={6} className="hidden w-60 origin-top text-ms md:block">
        <DropdownMenuItem asChild className="py-3.5">
          <Link href="/">
            <div className="flex flex-1 items-center justify-between">
              <span>For you</span>
              {pathname === '/' && <CheckmarkIcon />}
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-3.5">
          <Link href="/following">
            <div className="flex flex-1 items-center justify-between">
              <span>Following</span>
              {pathname === '/following' && <CheckmarkIcon />}
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-3.5">
          <Link href="/liked">
            <div className="flex flex-1 items-center justify-between">
              <span>Liked</span>
              {pathname === '/liked' && <CheckmarkIcon />}
            </div>
          </Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem asChild className="py-3.5">
          <Link href="/saved">
            <div className="flex flex-1 items-center justify-between">
              <span>Saved</span>
              {pathname === '/saved' && <CheckmarkIcon />}
            </div>
          </Link>
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
