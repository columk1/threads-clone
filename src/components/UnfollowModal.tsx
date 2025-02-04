import type { FunctionComponent } from 'react'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/Dialog'
import type { PostUser } from '@/services/users/users.queries'

import Avatar from './Avatar'

type UnfollowModalProps = {
  user: PostUser
  handleUnfollow: () => Promise<void>
  open: boolean
  onOpenChange: (open: boolean) => void
}

const UnfollowModal: FunctionComponent<UnfollowModalProps> = ({ user, handleUnfollow, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[278px] flex-col items-center justify-center gap-4 dark:bg-gray-2">
        <div className="flex flex-col items-center gap-3 p-6 pb-1">
          <div className="pb-0.5 text-center text-[15px] text-gray-7">
            <Avatar url={user.avatar} size="lg" />
          </div>
          <DialogTitle className="px-6 text-center text-[15px] font-bold">{`Unfollow ${user.username}?`}</DialogTitle>
          <DialogDescription className="sr-only">Confirm unfollow</DialogDescription>
        </div>
        <div className="flex w-full">
          <DialogClose asChild>
            <button
              type="button"
              className="w-full rounded-bl-2xl border-r border-t border-gray-5 px-4 py-3.5 active:bg-gray-0"
            >
              Cancel
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              type="button"
              onClick={handleUnfollow}
              className="w-full rounded-br-2xl border-t border-gray-5 px-4 py-3.5 font-bold text-error-text active:bg-gray-0 disabled:opacity-50"
            >
              Unfollow
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UnfollowModal
