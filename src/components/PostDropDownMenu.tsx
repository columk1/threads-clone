'use client'

import { type FunctionComponent, useState } from 'react'
import { toast } from 'sonner'

import { getUserFollowStatus, toggleFollow } from '@/app/actions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/DropdownMenu'

import { BookmarkIcon, KebabMenuIcon, LinkIcon, ReportIcon, UnfollowIcon } from './icons'

type PostDropDownMenuProps = {
  username: string
  isFollowed: boolean
}

const PostDropDownMenu: FunctionComponent<PostDropDownMenuProps> = ({ username, isFollowed: initialIsFollowed }) => {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed)

  const handleMouseEnter = () => {
    getUserFollowStatus(username).then((status) => {
      setIsFollowed(status)
    })
  }

  const handleFollowAction = async () => {
    const result = await toggleFollow(username, isFollowed ? 'unfollow' : 'follow')
    if (result.error) {
      toast(result.error)
    }
    if (result.success) {
      setIsFollowed(!isFollowed)
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger onMouseEnter={handleMouseEnter} className="dark:data-[state=open]:text-primary-text">
        <div className="group relative flex items-center justify-center rounded-full transition duration-200 active:scale-90">
          <KebabMenuIcon className="z-10 text-gray-7" />
          <div className="absolute size-8 rounded-full transition group-hover:bg-gray-3 group-active:bg-gray-3"></div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" alignOffset={-18} sideOffset={6} className="w-60 origin-top-right text-[15px] font-semibold">
        <DropdownMenuItem asChild className="leading-none">
          <button type="button" className="flex w-full justify-between">
            Save
            <BookmarkIcon />
          </button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!!isFollowed === true && (
          <button onClick={handleFollowAction} type="button" className="flex w-full justify-between leading-none">
            <DropdownMenuItem className="flex w-full justify-between">
              Unfollow
              <UnfollowIcon />
            </DropdownMenuItem>
          </button>
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
