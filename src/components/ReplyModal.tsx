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

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { IMG_UPLOAD_URL } from '@/lib/constants'
import { signUploadForm } from '@/lib/data'
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
  const [image, setImage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [text, setText] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const isValid = text.trim() !== '' || imageUrl !== null

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
    setImageUrl(null)
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

      try {
        const res = await fetch(IMG_UPLOAD_URL, {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        setImageUrl(data.secure_url)
      } catch (err) {
        toast('Oops! Something went wrong. Please try again.')
        setImage(null)
        // eslint-disable-next-line no-console
        console.log(err)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(() => {
      const formData = new FormData()
      formData.append('text', text)
      formData.append('parentId', post.id)
      if (imageUrl) {
        formData.append('image', imageUrl)
      }
      formAction(formData)
    })
  }

  useEffect(() => {
    if (state?.error) {
      toast(state.error)
    } else {
      if (state?.data) {
        router.refresh()
        closeModal()
      }
    }
  }, [state, router, closeModal, resetForm])

  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="min-w-[620px] max-md:hidden">
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
