'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import type { User } from 'lucia'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  type FunctionComponent,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { useAppStore } from '@/hooks/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { IMG_UPLOAD_URL, MAX_CHARACTERS } from '@/lib/constants'
import { signUploadForm } from '@/lib/data'
import type { Post } from '@/lib/db/Schema'
import { type ImageData, imageSchema } from '@/lib/schemas/zod.schema'
import { createReply } from '@/services/posts/posts.actions'
import type { PostUser } from '@/services/users/users.queries'
import { isTextWithinRange } from '@/utils/string/isWithinRange'

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
  const [image, setImage] = useState<string | null>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [text, setText] = useState('')
  const updatePost = useAppStore((state) => state.updatePost)
  const cachedPost = useAppStore((state) => state.posts[post.id])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const isTextValid = isTextWithinRange(text, MAX_CHARACTERS)
  const isValid = isTextValid || imageData !== null

  const handleTextInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const t = e.target
    if (t instanceof HTMLTextAreaElement) {
      t.style.height = 'auto' // Reset height
      t.style.height = `${t.scrollHeight}px` // Set to scroll height
    }
    setText(t.value)
  }, [])

  const handleUploadButtonClick = () => {
    fileInputRef?.current?.click()
  }

  const resetForm = useCallback(() => {
    setImage(null)
    setImageData(null)
    setText('')
    delete state?.data
    delete state?.error
  }, [state])

  const closeModal = useCallback(() => {
    setOpen(false)
    resetForm()
  }, [setOpen, resetForm])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Validate file
        await imageSchema.parseAsync(file)

        const optimisticUrl = URL.createObjectURL(file)
        setImage(optimisticUrl)

        const options = { eager: 'c_fit,h_430,w_508', folder: 'threads-clone/content' }

        const signData = await signUploadForm(options)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', signData.apiKey)
        formData.append('timestamp', signData.timestamp)
        formData.append('signature', signData.signature)
        Object.entries(options).forEach(([key, value]) => {
          formData.append(key, value)
        })

        const res = await fetch(IMG_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        const image: ImageData = {
          url: data.secure_url,
          width: data.width,
          height: data.height,
        }
        setImageData(image)
      } catch (err) {
        if (err instanceof z.ZodError) {
          toast(err.issues[0]?.message)
        } else {
          toast('Oops! Something went wrong. Please try again.')
        }
        setImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

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
  }, [state, router, closeModal, resetForm, post.id, updatePost, cachedPost, post.replyCount])

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
