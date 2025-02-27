import { useRouter } from 'next/navigation'
import type { FunctionComponent } from 'react'
import { toast } from 'sonner'

import { DialogClose, DialogContent, DialogTitle } from '@/components/Dialog'
import { handleDeleteAction } from '@/services/posts/posts.actions'

type DeletePostModalProps = {
  postId: string
}

const DeletePostModal: FunctionComponent<DeletePostModalProps> = ({ postId }) => {
  const router = useRouter()

  const onDelete = async () => {
    const result = await handleDeleteAction(postId)
    if (result.success) {
      setTimeout(() => toast.success('Deleted'), 500)
      router.refresh()
    } else {
      toast.error('Something went wrong')
    }
  }

  return (
    <DialogContent className="flex w-[278px] flex-col items-center justify-center gap-4 dark:bg-elevated-bg">
      <DialogTitle className="px-6 pt-6 text-base font-bold">Delete post?</DialogTitle>
      <div className="px-6 pb-0.5 text-center text-ms text-secondary-text">
        If you delete this post, you won't be able to restore it.
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
            onClick={onDelete}
            className="w-full rounded-br-2xl border-t border-primary-outline px-4 py-3.5 font-bold text-error-text active:bg-secondary-bg disabled:opacity-50"
          >
            Delete
          </button>
        </DialogClose>
      </div>
    </DialogContent>
  )
}

export default DeletePostModal
