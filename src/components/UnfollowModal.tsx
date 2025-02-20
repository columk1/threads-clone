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
      <DialogContent className="flex w-[278px] flex-col items-center justify-center gap-4 dark:bg-elevated-bg">
        <div className="flex flex-col items-center gap-3 p-6 pb-1">
          <div className="pb-0.5 text-center text-ms text-secondary-text">
            <Avatar url={user.avatar} size="lg" />
          </div>
          <DialogTitle className="px-6 text-center text-ms font-bold">{`Unfollow ${user.username}?`}</DialogTitle>
          <DialogDescription className="sr-only">Confirm unfollow</DialogDescription>
        </div>
        <div className="flex w-full">
          <DialogClose asChild>
            <button
              type="button"
              className="w-full rounded-bl-2xl border-r border-t border-primary-outline px-4 py-3.5 active:bg-secondary-bg"
            >
              Cancel
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              type="button"
              onClick={handleUnfollow}
              className="w-full rounded-br-2xl border-t border-primary-outline px-4 py-3.5 font-bold text-error-text active:bg-secondary-bg disabled:opacity-50"
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
