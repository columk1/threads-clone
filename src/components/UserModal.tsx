import { type FunctionComponent, useState } from 'react'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/Dialog'
import type { PostUser } from '@/services/users/users.queries'

import UserCard from './UserCard'

type UserModalProps = {
  user: PostUser
  isCurrentUser?: boolean
  onToggleFollow?: () => Promise<void>
  trigger: React.ReactNode
}

const UserModal: FunctionComponent<UserModalProps> = ({ user, isCurrentUser = false, onToggleFollow, trigger }) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex w-[380px] flex-col justify-center p-6 dark:bg-primary-bg">
        <DialogTitle className="sr-only">{user.username}</DialogTitle>
        <div className="flex flex-col gap-1">
          <UserCard user={user} isCurrentUser={isCurrentUser} onToggleFollow={onToggleFollow} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserModal
