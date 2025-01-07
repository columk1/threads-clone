'use client'

import type { FunctionComponent } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu'

import { BookmarkIcon, KebabMenuIcon, LinkIcon, ReportIcon, UnfollowIcon } from './icons'

type PostDropDownMenuProps = {
  // username: string
  isFollowed: boolean
  onToggleFollow?: () => Promise<void>
  isAuthenticated?: boolean
}

const PostDropDownMenu: FunctionComponent<PostDropDownMenuProps> = ({
  isFollowed,
  onToggleFollow,
  isAuthenticated,
}) => {
  // const handleMouseEnter = () => {
  //   getUserFollowStatus(username).then((status) => {
  //     if (status !== isFollowed) {
  //       onFollowToggle()
  //     }
  //   })
  // }
  // onMouseEnter={handleMouseEnter}

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="dark:data-[state=open]:text-primary-text">
        <div className="group relative flex items-center justify-center rounded-full transition duration-200 active:scale-90">
          <KebabMenuIcon className="z-10 text-gray-7" />
          <div className="absolute size-8 rounded-full transition group-hover:bg-gray-3 group-active:bg-gray-3"></div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        alignOffset={-18}
        sideOffset={6}
        className="w-60 origin-top-right text-[15px] font-semibold"
      >
        {isAuthenticated && (
          <>
            <DropdownMenuItem asChild className="leading-none">
              <button type="button" className="flex w-full justify-between">
                Save
                <BookmarkIcon />
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isFollowed && (
              <button onClick={onToggleFollow} type="button" className="flex w-full justify-between leading-none">
                <DropdownMenuItem className="flex w-full justify-between">
                  Unfollow
                  <UnfollowIcon />
                </DropdownMenuItem>
              </button>
            )}
          </>
        )}

        <DropdownMenuItem asChild className="leading-none text-error-text dark:focus:text-error-text">
          <button type="button" className="flex w-full justify-between text-left">
            Report
            <ReportIcon />
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="leading-none">
          <button type="button" className="flex w-full justify-between">
            Copy Link
            <LinkIcon />
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PostDropDownMenu
