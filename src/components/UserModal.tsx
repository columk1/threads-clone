import { type FunctionComponent, useState } from 'react'

import type { PostUser } from '@/app/actions'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/Dialog'

import UserCard from './UserCard'

type UserModalProps = {
  user: PostUser
  isAuthenticated?: boolean
  isCurrentUser?: boolean
  onToggleFollow?: () => Promise<void>
  trigger: React.ReactNode
}

const UserModal: FunctionComponent<UserModalProps> = ({ user, isAuthenticated = false, isCurrentUser = false, onToggleFollow, trigger }) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="flex w-[380px] flex-col items-center justify-center p-6 dark:bg-gray-1">
        <DialogTitle className="sr-only">
          {user.username}
        </DialogTitle>
        <div className="flex flex-col items-center gap-1">
          <UserCard user={user} isAuthenticated={isAuthenticated} isCurrentUser={isCurrentUser} onToggleFollow={onToggleFollow} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserModal
