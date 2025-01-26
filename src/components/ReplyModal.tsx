'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import type { User } from 'lucia'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FunctionComponent, startTransition, useActionState, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useAppStore } from '@/hooks/useAppStore'
import { useImageForm } from '@/hooks/useImageForm'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePostForm } from '@/hooks/usePostForm'
import type { Post } from '@/lib/db/Schema'
import { createReply } from '@/services/posts/posts.actions'
import type { PostUser } from '@/services/users/users.queries'

import Avatar from './Avatar'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'
import { ModalContent, ThreadMediaContent } from './NewThreadModal'
import TimeAgo from './TimeAgo'

const ParentThread = ({ user, author, post }: { user: User; author: PostUser; post: Post }) => {
  return (
    <div className="relative mb-5">
      {/* Vertical Line to Link to Parent Thread */}
      <div className="absolute bottom-[-15px] left-[17px] top-[51px] w-[2px] bg-gray-5"></div>

      {/* Content */}
      <div className="grid grid-cols-[48px_minmax(0,1fr)] text-[15px] leading-[21px]">
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
        <div className="">{post.text}</div>
      </div>
      <ThreadMediaContent image={post.image} />
    </div>
  )
}

type ReplyModalProps = {
  author: PostUser
  post: Post
  user: User
  trigger: React.ReactNode
}

const ReplyModal: FunctionComponent<ReplyModalProps> = ({ author, post, user, trigger }) => {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createReply, null)
  const { text, handleTextInput, isTextValid } = usePostForm()
  const { image, imageData, uploading, fileInputRef, handleFileChange, handleUploadButtonClick } = useImageForm()
  const updatePost = useAppStore((state) => state.updatePost)
  const cachedPost = useAppStore((state) => state.posts[post.id])

  const router = useRouter()

  const isValid = isTextValid || imageData !== null

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(() => {
      const formData = new FormData()
      formData.append('text', text)
      formData.append('parentId', post.id)
      if (imageData) {
        formData.append('image', imageData.url)
        formData.append('imageWidth', imageData.width)
        formData.append('imageHeight', imageData.height)
      }
      formAction(formData)
    })
  }

  useEffect(() => {
    if (state?.error) {
      toast(state.error)
    } else {
      if (state?.data) {
        // Update the parent post's reply count in the app store
        if (cachedPost) {
          updatePost(post.id, {
            ...cachedPost,
            replyCount: (cachedPost.replyCount ?? post.replyCount) + 1,
          })
        }
        router.refresh()
        closeModal()
      }
    }
  }, [state, router, closeModal, post.id, updatePost, cachedPost, post.replyCount])

  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="min-w-[620px] max-md:hidden">
          <div className="sr-only">
            <DialogDescription>Reply to a thread</DialogDescription>
          </div>
          <DialogHeader>
            <div className="grid h-14 grid-cols-[minmax(64px,100px)_minmax(0,1fr)_minmax(64px,100px)] px-6">
              <DialogClose asChild>
                <div className="flex">
                  <button type="button" onClick={closeModal} className="rounded-lg py-1 text-[17px]">
                    <span className="sr-only">Close</span>
                    Cancel
                  </button>
                </div>
              </DialogClose>
              <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">Reply</DialogTitle>
            </div>
            <div className="h-[0.25px] bg-gray-6"></div>
          </DialogHeader>
          <ModalContent
            state={{
              isDrawer: false,
              avatar: user.avatar,
              username: user.username,
              image,
              text,
              isValid,
              isPending,
              uploading,
              fileInputRef,
            }}
            actions={{ handleTextInput, handleUploadButtonClick, handleFileChange, handleSubmit }}
          >
            <ParentThread user={user} author={author} post={post} />
          </ModalContent>
          {/* Vertical Line - uncomment for multiple replies in thread feature */}
          {/* <div className="absolute bottom-1.5 left-[17px] top-[50px] w-[2px] bg-gray-5"></div> */}
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DrawerContent onOpenAutoFocus={(e) => e.preventDefault()} className="h-full min-w-full border-none">
        <div className="sr-only">
          <DialogDescription>Reply to a thread</DialogDescription>
        </div>
        <DialogHeader className="grid h-14 grid-cols-[minmax(64px,100px)_minmax(0,1fr)_minmax(64px,100px)]">
          <DialogClose asChild>
            <div className="flex">
              <button type="button" onClick={closeModal} className="rounded-lg py-1 text-[17px]">
                <span className="sr-only">Close</span>
                Cancel
              </button>
            </div>
          </DialogClose>
          <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">Reply</DialogTitle>
        </DialogHeader>
        <ModalContent
          state={{
            isDrawer: true,
            avatar: user.avatar,
            username: user.username,
            image,
            text,
            isValid,
            isPending,
            uploading,
            fileInputRef,
          }}
          actions={{ handleTextInput, handleUploadButtonClick, handleFileChange, handleSubmit }}
        >
          <ParentThread user={user} author={author} post={post} />
        </ModalContent>
      </DrawerContent>
    </Drawer>
  )
}

export default ReplyModal
