import type { FunctionComponent } from 'react'

import type { PostUser } from '@/app/actions'
import { Dialog, DialogContent, DialogTitle } from '@/components/Dialog'
import { useModal } from '@/hooks/useModal'

import UserCard from './UserCard'

type UserModalProps = {
  user: PostUser
  isAuthenticated?: boolean
  isCurrentUser?: boolean
  onToggleFollow?: () => Promise<void>
}

const UserModal: FunctionComponent<UserModalProps> = ({ user, isAuthenticated = false, isCurrentUser = false, onToggleFollow }) => {
  const { isOpen, modalType, handleOpenChange } = useModal()

  return (
    <Dialog open={isOpen && modalType === 'user'} onOpenChange={handleOpenChange}>
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
