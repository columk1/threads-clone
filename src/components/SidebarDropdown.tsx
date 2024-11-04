import Link from 'next/link'
import { type FunctionComponent, useState } from 'react'

import { logout } from '@/app/actions'
import MoreIcon from '@/components/icons/More'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './DropdownMenu'

const SidebarDropdown: FunctionComponent = () => {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger onPointerDown={e => e.preventDefault()} onClick={() => setOpen(prev => !prev)} className="hidden dark:data-[state=open]:text-primary-text md:block">
        <div className="flex size-[54px] items-center justify-center transition hover:text-primary-text active:scale-90">
          <MoreIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" alignOffset={5} sideOffset={-51} className="w-60 origin-bottom-left text-[15px]">
        <DropdownMenuItem>Appearance</DropdownMenuItem>
        <DropdownMenuItem>Insights</DropdownMenuItem>
        <DropdownMenuItem asChild className="leading-none"><Link href="/settings">Settings</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Report a problem</DropdownMenuItem>
        <DropdownMenuItem asChild className="leading-none text-error-text dark:focus:text-error-text">
          <button type="button" onClick={logout} className="w-full text-left">
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SidebarDropdown
