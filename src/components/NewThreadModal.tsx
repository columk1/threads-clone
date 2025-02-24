'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import cx from 'clsx'
import { useRouter } from 'next/navigation'
import { type FunctionComponent, useActionState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/Dialog'
import { Drawer, DrawerContent } from '@/components/Drawer'
import { ImageIcon } from '@/components/icons'
import Spinner from '@/components/Spinner/Spinner'
import { useImageForm } from '@/hooks/useImageForm'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { usePostForm } from '@/hooks/usePostForm'
import { MAX_CHARACTERS } from '@/lib/constants'
import { createPost } from '@/services/posts/posts.actions'

type ModalActions = {
  closeModal?: () => void
  // handleSubmit: () => void
  handleTextInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleUploadButtonClick: () => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
}

type ModalState = {
  isReply?: boolean
  isDrawer?: boolean
  avatar: string | null
  username: string
  image: string | null
  imageData?: { url: string; width: string; height: string } | null
  text: string
  isValid: boolean
  isPending: boolean
  uploading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  parentId?: string
  parentUsername?: string
  formRef: React.RefObject<HTMLFormElement | null>
}

type ModalContentProps = {
  state: ModalState
  actions: ModalActions
  children?: React.ReactNode
}

export const ThreadMediaContent = ({ image, children }: { image: string | null; children?: React.ReactNode }) => {
  return (
    <div className="flex pl-12 text-secondary-text">
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
  const {
    isReply,
    isDrawer,
    avatar,
    username,
    image,
    imageData,
    text,
    isValid,
    isPending,
    uploading,
    fileInputRef,
    parentId,
    parentUsername,
    formRef,
  } = state
  const { handleTextInput, handleUploadButtonClick, handleFileChange } = actions

  const textInputRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (node) {
        const length = node.value.length
        node.setSelectionRange(length, length)
        const event = { target: node } as React.ChangeEvent<HTMLTextAreaElement>
        handleTextInput(event) // Set the height of the textarea on mount
      }
    },
    [handleTextInput],
  )

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

  const submitForm = useCallback(() => {
    formRef.current?.requestSubmit()
  }, [formRef])

  // const submitForm = useCallback(
  //   (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault()
  //     handleSubmit()
  //   },
  //   [handleSubmit],
  // )

  return (
    <div
      className={cx(
        'flex flex-col h-full',
        isDrawer ? 'min-h-[calc(100dvh-56px)] max-h-[calc(100dvh-56px)]' : 'max-h-[calc(100dvh-120px)]',
      )}
    >
      <div ref={contentRef} className="overflow-y-auto">
        <div className={cx('pt-2', !isDrawer && 'px-6 pb-1')}>
          {children}
          <div className="relative">
            <div className="grid grid-cols-[48px_minmax(0,1fr)] text-ms leading-[21px]">
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
                placeholder={isReply ? `Reply to ${parentUsername}...` : "What's new?"}
                minLength={1}
                className="col-start-2 mb-[2px] w-full resize-none bg-transparent placeholder:text-secondary-text focus:outline-none focus:ring-0"
                rows={1}
                value={text}
                onInput={handleTextInput}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid && !isPending) {
                    submitForm()
                  }
                }}
              />
            </div>
            <ThreadMediaContent image={image}>
              <button
                type="button"
                onClick={handleUploadButtonClick}
                className="mt-2 flex h-7 items-center justify-start transition active:scale-85"
              >
                <ImageIcon />
              </button>
            </ThreadMediaContent>
          </div>
        </div>
      </div>
      <div
        className={cx(
          'flex items-center justify-between py-4 mt-auto text-ms text-secondary-text',
          !isDrawer && 'px-6',
        )}
      >
        Anyone can reply & quote
        <div className="flex items-center gap-3">
          <RemainingCharacters currentCount={text.length} limit={MAX_CHARACTERS} />
          <Button
            type="submit"
            variant={isDrawer ? 'light' : 'dark'}
            disabled={!isValid || isPending}
            className={isDrawer ? 'rounded-full text-secondary-bg' : ''}
          >
            {uploading ? <Spinner /> : 'Post'}
          </Button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
      <input type="hidden" name="text" value={text} />
      {imageData && (
        <>
          <input type="hidden" name="image" value={imageData.url} />
          <input type="hidden" name="imageWidth" value={imageData.width} />
          <input type="hidden" name="imageHeight" value={imageData.height} />
        </>
      )}
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
    </div>
  )
}

type NewThreadModalProps = {
  username: string
  avatar: string | null
  handleOpenChange: (open: boolean) => void
}

export const ModalHeader = ({
  title,
  description,
  isDrawer = false,
}: {
  title: string
  description: string
  isDrawer?: boolean
}) => (
  <>
    <div className="sr-only">
      <DialogDescription>{description}</DialogDescription>
    </div>
    <DialogHeader>
      <div
        className={cx('grid h-14 grid-cols-[minmax(64px,100px)_minmax(0,1fr)_minmax(64px,100px)]', !isDrawer && 'px-6')}
      >
        <DialogClose asChild>
          <div className="flex">
            <button type="button" className="rounded-lg py-1 text-[17px]">
              <span className="sr-only">Close</span>
              Cancel
            </button>
          </div>
        </DialogClose>
        <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">{title}</DialogTitle>
      </div>
      <div className={cx('h-[0.25px] bg-primary-outline', isDrawer && '-mx-6')}></div>
    </DialogHeader>
  </>
)

const NewThreadModal: FunctionComponent<NewThreadModalProps> = ({ username, avatar, handleOpenChange }) => {
  const [state, formAction, isPending] = useActionState(createPost, null)
  const { text, handleTextInput, isTextValid } = usePostForm()
  const { image, imageData, uploading, fileInputRef, handleFileChange, handleUploadButtonClick } = useImageForm()
  const formRef = useRef<HTMLFormElement>(null)

  const router = useRouter()

  const isValid = isTextValid || imageData !== null

  const closeModal = useCallback(() => {
    handleOpenChange(false)
  }, [handleOpenChange])

  // preloadNextImage(image.url, Number(image.width), Number(image.height))
  // TODO: Stop using next/image to preload images in a simpler way (but must use Cloudinary transformations)
  // const img = new Image()
  // img.src = image.url

  // const handleSubmit = () => {
  //   startTransition(() => {
  //     const formData = new FormData()
  //     formData.append('text', text)
  //     if (imageData) {
  //       formData.append('image', imageData.url)
  //       formData.append('imageWidth', imageData.width)
  //       formData.append('imageHeight', imageData.height)
  //     }
  //     formAction(formData)
  //   })
  // }

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

  const modalState = {
    avatar,
    username,
    text,
    image,
    imageData,
    isValid,
    isPending,
    uploading,
    fileInputRef,
    formRef,
  }

  const modalActions = {
    closeModal,
    handleUploadButtonClick,
    handleFileChange,
    handleTextInput,
  }

  if (isDesktop) {
    return (
      <Dialog open onOpenChange={handleOpenChange}>
        <DialogContent className="min-w-[620px] max-md:hidden">
          <ModalHeader title="New thread" description="Create a new thread" />
          <form ref={formRef} action={formAction}>
            <ModalContent state={{ ...modalState }} actions={modalActions} />
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open onOpenChange={handleOpenChange}>
      <DrawerContent className="h-full min-w-full border-none">
        <ModalHeader title="New thread" description="Create a new thread" isDrawer />
        <form ref={formRef} action={formAction}>
          <ModalContent state={{ ...modalState, isDrawer: true }} actions={modalActions} />
        </form>
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
