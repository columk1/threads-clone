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
      router.refresh()
    } else {
      toast.error('Something went wrong')
    }
  }

  return (
    <DialogContent className="flex w-[278px] flex-col items-center justify-center gap-4 dark:bg-gray-2">
      <DialogTitle className="px-6 pt-6 text-base font-bold">Delete post?</DialogTitle>
      <div className="px-6 pb-0.5 text-center text-[15px] text-gray-7">
        If you delete this post, you won't be able to restore it.
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
        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-br-2xl border-t border-gray-5 px-4 py-3.5 font-bold text-error-text active:bg-gray-0 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </DialogContent>
  )
}

export default DeletePostModal
