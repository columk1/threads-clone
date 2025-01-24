'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import cx from 'clsx'
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

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { IMG_UPLOAD_URL } from '@/lib/constants'
import { signUploadForm } from '@/lib/data'
import { imageSchema } from '@/lib/schemas/zod.schema'
import { createPost } from '@/services/posts/posts.actions'

import Avatar from './Avatar'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'
import { ImageIcon } from './icons'

type ModalActions = {
  closeModal?: () => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  handleTextInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleUploadButtonClick: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
}

type ModalState = {
  isDrawer?: boolean
  avatar: string | null
  username: string
  image: string | null
  text: string
  isValid: boolean
  isPending: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

type ModalContentProps = {
  state: ModalState
  actions: ModalActions
  children?: React.ReactNode
}

export const ThreadMediaContent = ({ image, children }: { image: string | null; children?: React.ReactNode }) => {
  return (
    <div className="flex pl-12 text-gray-7">
      <div className="flex-1">
        {image && (
          <div className="mb-1 mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="preview" className="max-h-[430px] rounded-lg object-contain" />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export const RemainingCharacters = ({ currentCount, limit }: { currentCount: number; limit: number }) => {
  const remainingCount = limit - currentCount
  return (
    <span className={remainingCount < 0 ? 'text-error-text' : ''}>{remainingCount > 50 ? '' : remainingCount}</span>
  )
}

export const ModalContent: React.FC<ModalContentProps> = ({ state, actions, children }) => {
  const { isDrawer, avatar, username, image, text, isValid, isPending, fileInputRef } = state
  const { handleTextInput, handleUploadButtonClick, handleFileChange, handleSubmit } = actions

  const textInputRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      const length = node.value.length
      node.setSelectionRange(length, length)
    }
  }, [])

  return (
    <form
      onSubmit={handleSubmit}
      className={cx('flex h-full flex-col justify-between', isDrawer && 'max-h-[calc(100vh-56px)]')}
    >
      <div className={cx('overflow-y-auto', !isDrawer && `max-h-[calc(100vh-200px)]`)}>
        <div className={cx(`pt-2`, !isDrawer && `px-6 pb-1 pt-2`)}>
          {children}
          <div className="relative">
            <div className="grid grid-cols-[48px_minmax(0,1fr)] text-[15px] leading-[21px]">
              <div className="col-start-1 row-start-1 row-end-[span_2] pt-[5px]">
                <Avatar size="sm" url={avatar} />
              </div>
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{username}</div>
                </div>
              </div>
              {/* Multi-line Input */}
              <textarea
                ref={textInputRef}
                autoComplete="off"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                placeholder="What's new?"
                minLength={1}
                className="col-start-2 mb-[2px] w-full resize-none bg-transparent placeholder:text-gray-7 focus:outline-none focus:ring-0"
                rows={1}
                value={text}
                onInput={handleTextInput}
              />
            </div>
            <ThreadMediaContent image={image}>
              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="mt-2 flex h-9 items-center justify-start transition active:scale-85"
              >
                <ImageIcon />
              </button>
            </ThreadMediaContent>
          </div>
        </div>
      </div>
      <div className={cx(`flex items-center justify-between text-[15px] text-gray-7 py-4`, !isDrawer && `p-6`)}>
        Anyone can reply & quote
        <div className="flex items-center gap-3">
          <RemainingCharacters currentCount={text.length} limit={500} />
          <button
            type="submit"
            disabled={!isValid || isPending}
            className={cx(
              'ml-auto h-9 px-4 font-semibold transition active:scale-95 disabled:opacity-30',
              isDrawer
                ? 'rounded-full bg-primary-text text-gray-0'
                : 'rounded-lg border border-gray-5 text-primary-text',
            )}
          >
            Post
          </button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" name="image" onChange={handleFileChange} className="hidden" />
    </form>
  )
}

type NewThreadModalProps = {
  username: string
  avatar: string | null
  handleOpenChange: (open: boolean) => void
}

type ImageData = {
  url: string
  width: string
  height: string
} | null

const NewThreadModal: FunctionComponent<NewThreadModalProps> = ({ username, avatar, handleOpenChange }) => {
  const [state, formAction, isPending] = useActionState(createPost, null)
  const [image, setImage] = useState<string | null>(null)
  const [imageData, setImageData] = useState<ImageData>(null)
  const [text, setText] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const isValid = text.trim() !== '' || imageData !== null

  const handleTextInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const t = e.target
    if (t instanceof HTMLTextAreaElement) {
      t.style.height = 'auto' // Reset height
      t.style.height = `${t.scrollHeight}px` // Set to scroll height
    }
    setText(t.value)
  }, [])

  const closeModal = useCallback(() => {
    handleOpenChange(false)
  }, [handleOpenChange])

  const handleUploadButtonClick = () => {
    fileInputRef?.current?.click()
  }

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
      if (state?.success) {
        router.refresh()
        closeModal()
      }
    }
  }, [state, router, closeModal])

  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="min-w-[620px] max-md:hidden">
          <div className="sr-only">
            <DialogDescription>Create a new thread</DialogDescription>
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
              <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">New thread</DialogTitle>
            </div>
            <div className="h-[0.25px] bg-gray-6"></div>
          </DialogHeader>
          <ModalContent
            state={{ avatar, username, image, text, isValid, isPending, fileInputRef }}
            actions={{ closeModal, handleUploadButtonClick, handleFileChange, handleTextInput, handleSubmit }}
          />
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open onOpenChange={handleOpenChange}>
      <DrawerContent className="h-full min-w-full border-none">
        <div className="sr-only">
          <DialogDescription>Create a new thread</DialogDescription>
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
          <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">New thread</DialogTitle>
        </DialogHeader>
        <ModalContent
          state={{ isDrawer: true, avatar, text, username, image, fileInputRef, isValid, isPending }}
          actions={{ closeModal, handleUploadButtonClick, handleFileChange, handleTextInput, handleSubmit }}
        />
      </DrawerContent>
    </Drawer>
  )
}

type NewThreadModalWrapperProps = {
  username: string
  avatar: string | null
}

const NewThreadModalWrapper = ({ username, avatar }: NewThreadModalWrapperProps) => {
  const { isOpen, handleOpenChange } = useModal()
  return isOpen ? <NewThreadModal username={username} avatar={avatar} handleOpenChange={handleOpenChange} /> : null
}

export default NewThreadModalWrapper
