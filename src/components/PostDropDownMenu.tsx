'use client'

import type { FunctionComponent } from 'react'
import { toast } from 'sonner'

import { Dialog, DialogTrigger } from '@/components/Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu'
import { REPORTED_CONFIRMATION_MESSAGE } from '@/lib/constants'
import { moderatePost } from '@/services/posts/posts.actions'

import DeletePostDialogContent from './DeletePostModal'
import { DeleteIcon, KebabMenuIcon, LinkIcon, ReportIcon, UnfollowIcon } from './icons'

type PostDropDownMenuProps = {
  isFollowed: boolean
  onToggleFollow?: () => Promise<void>
  isAuthenticated?: boolean
  isCurrentUser?: boolean
  postId: string
}

const PostDropDownMenu: FunctionComponent<PostDropDownMenuProps> = ({
  isFollowed,
  onToggleFollow,
  isAuthenticated,
  isCurrentUser,
  postId,
}) => {
  const handleReport = () => {
    moderatePost(postId)
    toast(REPORTED_CONFIRMATION_MESSAGE)
  }

  return (
    <Dialog>
      <DropdownMenu modal>
        <DropdownMenuTrigger className="dark:data-[state=open]:text-primary-text">
          <div className="group relative flex items-center justify-center rounded-full transition duration-200 active:scale-90">
            <KebabMenuIcon className="z-10 text-secondary-text" />
            <div className="absolute size-8 rounded-full transition group-hover:bg-tertiary-bg group-active:bg-tertiary-bg"></div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          alignOffset={-18}
          sideOffset={6}
          className="w-60 origin-top-right text-ms font-semibold"
        >
          {isAuthenticated && (
            <>
              {isFollowed && (
                <button onClick={onToggleFollow} type="button" className="flex w-full justify-between leading-none">
                  <DropdownMenuItem className="flex w-full items-center justify-between">
                    Unfollow
                    <UnfollowIcon />
                  </DropdownMenuItem>
                </button>
              )}
              {!isCurrentUser && (
                <DropdownMenuItem asChild className="leading-none text-error-text dark:focus:text-error-text">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left"
                    onClick={handleReport}
                  >
                    Report
                    <ReportIcon />
                  </button>
                </DropdownMenuItem>
              )}
            </>
          )}

          {isCurrentUser && (
            <DropdownMenuItem className="leading-none text-error-text dark:focus:text-error-text">
              <DialogTrigger asChild>
                <button type="button" className="flex w-full items-center justify-between text-left">
                  Delete
                  <DeleteIcon />
                </button>
              </DialogTrigger>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="leading-none">
            <button type="button" className="flex w-full items-center justify-between">
              Copy Link
              <LinkIcon />
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isCurrentUser && <DeletePostDialogContent postId={postId} />}
    </Dialog>
  )
}

export default PostDropDownMenu
