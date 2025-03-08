import { usePathname, useRouter } from 'next/navigation'
import type { FunctionComponent } from 'react'
import { toast } from 'sonner'

import { DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/Dialog'
import { useAppStore } from '@/hooks/useAppStore'
import { handleDeleteAction } from '@/services/posts/posts.actions'

type DeletePostModalProps = {
  postId: string
}

const DeletePostModal: FunctionComponent<DeletePostModalProps> = ({ postId }) => {
  const router = useRouter()
  const pathname = usePathname()
  const updatePost = useAppStore((state) => state.updatePost)
  const cachedPosts = useAppStore((state) => state.posts)

  const onDelete = async () => {
    const { success, data } = await handleDeleteAction(postId)
    if (success) {
      // If this was a reply, update the parent's reply count in the app store
      if (data?.parentId) {
        const parentPost = cachedPosts[data.parentId]
        if (parentPost) {
          updatePost(data.parentId, {
            isLiked: parentPost.isLiked,
            likeCount: parentPost.likeCount,
            replyCount: parentPost.replyCount - 1,
            isReposted: parentPost.isReposted,
            repostCount: parentPost.repostCount,
          })
        }
      }

      setTimeout(() => toast.success('Deleted'), 500)

      // Check if we're on the deleted post's page
      const isOnDeletedPostPage = pathname.includes(`/post/${postId}`)

      if (isOnDeletedPostPage) {
        router.push('/')
      }
      router.refresh()
    } else {
      toast.error('Something went wrong')
    }
  }

  return (
    <DialogContent className="flex w-[278px] flex-col items-center justify-center gap-4 dark:bg-elevated-bg">
      <div className="sr-only">
        <DialogDescription>Confirm delete</DialogDescription>
      </div>
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
