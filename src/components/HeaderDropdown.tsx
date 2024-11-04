import Link from 'next/link'
import type { FunctionComponent } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu'

import { CaretIcon, CheckmarkIcon } from './icons'

type HeaderDropdownProps = {
  pathname: string
}

export const HeaderDropdown: FunctionComponent<HeaderDropdownProps> = ({ pathname }) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="rounded-full dark:data-[state=open]:text-primary-text">
        <div className="flex size-[22px] items-center justify-center rounded-full border-[0.5px] border-gray-5 bg-active-bg transition duration-200 hover:scale-110 hover:text-primary-text active:scale-90">
          <CaretIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent alignOffset={0} sideOffset={6} className="hidden w-60 origin-top text-[15px] md:block">
        <Link href="/">
          <DropdownMenuItem className="py-3.5">
            <div className="flex flex-1 items-center justify-between">
              <span>For you</span>
              {pathname === '/' && <CheckmarkIcon />}
            </div>
          </DropdownMenuItem>
        </Link>
        <Link href="/following">
          <DropdownMenuItem className="py-3.5">
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
  )
}
