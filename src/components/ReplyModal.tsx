import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type FunctionComponent, useActionState, useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

import Avatar from '@/components/Avatar'
import { Dialog, DialogContent, DialogTrigger } from '@/components/Dialog'
import { Drawer, DrawerContent } from '@/components/Drawer'
import { ModalContent, ModalHeader, ThreadMediaContent } from '@/components/NewThreadModal'
import { ThreadText } from '@/components/Thread'
import TimeAgo from '@/components/TimeAgo'
import { showPostSuccessToast } from '@/components/ui/toast'
import { useAppStore } from '@/hooks/useAppStore'
import { useImageForm } from '@/hooks/useImageForm'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePostForm } from '@/hooks/usePostForm'
import type { Post } from '@/lib/db/Schema'
import type { SessionUser } from '@/lib/Session'
import { createReply } from '@/services/posts/posts.actions'
import type { PostUser } from '@/services/users/users.queries'

const ParentThread = ({ user, author, post }: { user: SessionUser; author: PostUser; post: Post }) => {
  return (
    <div className="relative mb-5">
      {/* Vertical Line to Link to Parent Thread */}
      <div className="absolute bottom-[-15px] left-[17px] top-[51px] w-[2px] bg-primary-outline"></div>

      {/* Content */}
      <div className="grid grid-cols-[48px_minmax(0,1fr)] text-ms leading-[21px]">
        <div className="col-start-1 row-start-1 row-end-[span_2] pt-[5px]">
          <Avatar size="sm" url={author.avatar} />
        </div>
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link href={`/@${author.username}`} className="hover:underline">
              <div className="font-semibold">{author.username}</div>
            </Link>
            <a href={`/@${user.username}/post/${post.id}`}>
              <TimeAgo publishedAt={post.createdAt} />
            </a>
          </div>
        </div>
        <ThreadText text={post.text} />
      </div>
      <ThreadMediaContent image={post.image} />
    </div>
  )
}

type ReplyModalProps = {
  author: PostUser
  post: Post
  user: SessionUser
  trigger: React.ReactNode
}

const ReplyModal: FunctionComponent<ReplyModalProps> = ({ author, post, user, trigger }) => {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createReply, null)
  const formRef = useRef<HTMLFormElement>(null)
  const { text, setText, handleTextInput, isTextValid } = usePostForm()
  const {
    image,
    setImage,
    imageData,
    setImageData,
    uploading,
    fileInputRef,
    handleFileChange,
    handleUploadButtonClick,
  } = useImageForm()
  const updatePost = useAppStore((state) => state.updatePost)
  const cachedPost = useAppStore((state) => state.posts[post.id])
  const [isSubmitting, startTransition] = useTransition()

  const router = useRouter()
  const currentPath = usePathname()

  const isValid = isTextValid || imageData !== null || uploading

  const resetForm = useCallback(() => {
    setText('')
    setImage(null)
    setImageData(null)
    if (state?.success) {
      state.success = false
    }
  }, [setText, setImage, setImageData, state])

  const closeModal = useCallback(() => {
    setOpen(false)
    resetForm()
  }, [resetForm])

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      if (!uploading) {
        startTransition(async () => {
          await formAction(formData)
        })
      }
    },
    [formAction, uploading],
  )

  useEffect(() => {
    if (state?.error) {
      toast(state.error)
      return
    }
    if (state?.success) {
      // Update the parent post's reply count in the app store
      if (cachedPost) {
        updatePost(post.id, {
          ...cachedPost,
          replyCount: (cachedPost.replyCount ?? post.replyCount) + 1,
        })
      }
      showPostSuccessToast({
        username: user.username,
        postId: state.data?.id,
      })
      router.refresh()
      closeModal()
    }
  }, [
    state?.success,
    state?.error,
    router,
    currentPath,
    closeModal,
    updatePost,
    post.id,
    post.replyCount,
    cachedPost,
    user.username,
    state?.data?.id,
  ])

  const modalState = {
    isReply: true,
    avatar: user.avatar,
    username: user.username,
    text,
    image,
    imageData,
    isValid,
    isPending: isPending || isSubmitting,
    uploading,
    fileInputRef,
    parentId: post.id,
    parentUsername: author.username,
    formRef,
  }

  const modalActions = {
    closeModal,
    handleUploadButtonClick,
    handleFileChange,
    handleTextInput,
  }

  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {open && (
          <DialogContent className="min-w-[620px] max-md:hidden">
            <ModalHeader title="Reply" description="Reply to a thread" />
            <form ref={formRef} action={handleSubmit}>
              <ModalContent state={{ ...modalState }} actions={modalActions}>
                <ParentThread user={user} author={author} post={post} />
              </ModalContent>
            </form>
            {/* Vertical Line to be used for multiple replies in thread feature */}
            {/* <div className="absolute bottom-1.5 left-[17px] top-[50px] w-[2px] bg-primary-outline"></div> */}
          </DialogContent>
        )}
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {open && (
        <DrawerContent onOpenAutoFocus={(e) => e.preventDefault()} className="h-full min-w-full border-none">
          <ModalHeader title="Reply" description="Reply to a thread" isDrawer />
          <form ref={formRef} action={handleSubmit}>
            <ModalContent state={{ ...modalState, isDrawer: true }} actions={modalActions}>
              <ParentThread user={user} author={author} post={post} />
            </ModalContent>
          </form>
        </DrawerContent>
      )}
    </Drawer>
  )
}

export default ReplyModal
