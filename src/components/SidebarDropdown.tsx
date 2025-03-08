import { type FunctionComponent, useState } from 'react'

import MoreIcon from '@/components/icons/HamburgerMenu'
import { logout } from '@/services/auth/auth.actions'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu'

type SidebarDropdownProps = { isAuthenticated: boolean }

const SidebarDropdown: FunctionComponent<SidebarDropdownProps> = ({ isAuthenticated }) => {
  const [open, setOpen] = useState(false)
  const [closedByKeyboardEvent, setClosedByKeyboardEvent] = useState(false)

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => setOpen((prev) => !prev)}
        className="hidden dark:data-[state=open]:text-primary-text md:block"
      >
        <div className="flex size-[54px] items-center justify-center transition hover:text-primary-text active:scale-90">
          <MoreIcon />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        // Only return focus to the trigger when the dropdown is closed by a keyboard event
        onClick={() => setClosedByKeyboardEvent(false)}
        onKeyDown={() => setClosedByKeyboardEvent(true)}
        onCloseAutoFocus={(e) => {
          if (!closedByKeyboardEvent) {
            e.preventDefault()
          }
        }}
        align="start"
        alignOffset={5}
        sideOffset={-51}
        className="w-60 origin-bottom-left text-ms"
      >
        <DropdownMenuItem asChild>
          <a href="https://github.com/columk1/threads-clone/issues/new" target="_blank" rel="noopener noreferrer">
            Report a problem
          </a>
        </DropdownMenuItem>
        {isAuthenticated && (
          <DropdownMenuItem asChild className="leading-none text-error-text dark:focus:text-error-text">
            <button type="button" onClick={logout} className="w-full text-left">
              Log out
            </button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SidebarDropdown
