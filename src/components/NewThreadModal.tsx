'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import cx from 'clsx'
import { useRouter } from 'next/navigation'
import { type FunctionComponent, startTransition, useActionState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { useImageForm } from '@/hooks/useImageForm'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { usePostForm } from '@/hooks/usePostForm'
import { MAX_CHARACTERS } from '@/lib/constants'
import { createPost } from '@/services/posts/posts.actions'

import Avatar from './Avatar'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'
import { ImageIcon } from './icons'
import Spinner from './spinner/Spinner'

type ModalActions = {
  closeModal?: () => void
  handleSubmit: () => void
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
  uploading: boolean
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
  const { isDrawer, avatar, username, image, text, isValid, isPending, uploading, fileInputRef } = state
  const { handleTextInput, handleUploadButtonClick, handleFileChange, handleSubmit } = actions

  const textInputRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      const length = node.value.length
      node.setSelectionRange(length, length)
    }
  }, [])

  const contentRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return
    }
    // 75 is quite arbitrary but it is the smallest value that I found to work consistently,
    // it could be trying a callback on the image component to scroll this container
    const delayScroll = setTimeout(() => {
      node.scrollTop = node.scrollHeight
    }, 75)
    return () => clearTimeout(delayScroll)
  }, [])

  const submitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      handleSubmit()
    },
    [handleSubmit],
  )

  return (
    <form
      onSubmit={submitForm}
      className={cx('flex h-full flex-col justify-between', isDrawer && 'max-h-[calc(100vh-56px)]')}
    >
      <div ref={contentRef} className={cx('overflow-y-auto', !isDrawer && `max-h-[calc(100vh-200px)]`)}>
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
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid && !isPending) {
                    handleSubmit()
                  }
                }}
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
          <RemainingCharacters currentCount={text.length} limit={MAX_CHARACTERS} />
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
            {uploading ? <Spinner /> : 'Post'}
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

const NewThreadModal: FunctionComponent<NewThreadModalProps> = ({ username, avatar, handleOpenChange }) => {
  const [state, formAction, isPending] = useActionState(createPost, null)
  const { text, handleTextInput, isTextValid } = usePostForm()
  const { image, imageData, uploading, fileInputRef, handleFileChange, handleUploadButtonClick } = useImageForm()

  const router = useRouter()

  const isValid = isTextValid || imageData !== null

  const closeModal = useCallback(() => {
    handleOpenChange(false)
  }, [handleOpenChange])

  // preloadNextImage(image.url, Number(image.width), Number(image.height))
  // TODO: Stop using next/image to preload images in a simpler way (but must use Cloudinary transformations)
  // const img = new Image()
  // img.src = image.url

  const handleSubmit = () => {
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
            state={{ avatar, username, text, image, isValid, isPending, uploading, fileInputRef }}
            actions={{ closeModal, handleUploadButtonClick, handleFileChange, handleTextInput, handleSubmit }}
          />
        </DialogContent>
      </Dialog>
    )
  }
  // Mobile Drawer
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
          state={{ isDrawer: true, avatar, username, text, image, isValid, isPending, uploading, fileInputRef }}
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
