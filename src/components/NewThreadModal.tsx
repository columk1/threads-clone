'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import cx from 'clsx'
import { useRouter } from 'next/navigation'
import { type FunctionComponent, useActionState, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { createPost, updateAvatar } from '@/app/actions'
import { IMG_UPLOAD_URL } from '@/constants/cloudinaryURL'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'
import { signUploadForm } from '@/lib/data'
import { stringToSafePublicId } from '@/utils/stringToSafePublicId'

import Avatar from './Avatar'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'
import { ImageIcon } from './icons'

type ModalActions = {
  closeModal: () => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
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

const ModalContent: React.FC<ModalContentProps> = ({ state, actions, children }) => {
  const { isDrawer, avatar, username, image, text, isValid, isPending, fileInputRef } = state
  const { handleTextChange, handleTextInput, handleUploadButtonClick, handleFileChange, closeModal } = actions

  const textInputRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      const length = node.value.length
      node.setSelectionRange(length, length)
    }
  }, [])

  return (
    <form onSubmit={actions.handleSubmit} className={cx('flex flex-col justify-between', isDrawer && 'h-[calc(100%-56px)]')}>
      <div className={cx('overflow-y-auto', !isDrawer && `max-h-[calc(100vh-200px)]`)}>
        <div className={cx(`pt-2`, !isDrawer && `px-6 pb-1 pt-2`)}>
          <div className="relative">
            <div className="grid grid-cols-[48px_minmax(0,1fr)] text-[15px] leading-[21px]">
              <div className="col-start-1 row-start-1 row-end-[span_2] pt-1 ">
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
                onChange={handleTextChange}
                placeholder="What's new?"
                minLength={1}
                className="col-start-2 mb-[2px] w-full resize-none bg-transparent placeholder:text-gray-7 focus:outline-none focus:ring-0"
                rows={1}
                value={text}
                onInput={handleTextInput}
                // onFocus={handleTextAreaFocus}
              />
              {children}
            </div>
            {/* Media Section */}
            <div className="flex pl-12 text-gray-7">
              <div className="flex-1">
                {image && (
                  <div className="mb-1 mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt="preview"
                      className="max-h-[430px] rounded-lg bg-white object-contain"
                    />
                  </div>
                )}
                <button type="button" onClick={handleUploadButtonClick} className="mt-2 flex h-9 items-center justify-start transition active:scale-85">
                  <ImageIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={cx(`flex items-center justify-between text-[15px] text-gray-7`, !isDrawer && `p-6`)}>
        Anyone can reply & quote
        <button type="submit" onClick={closeModal} disabled={!isValid || isPending} className="ml-auto h-9 rounded-lg border border-gray-5 px-4 font-semibold text-primary-text transition active:scale-95 disabled:opacity-30">
          Post
        </button>
      </div>
      <input ref={fileInputRef} type="file" name="image" onChange={handleFileChange} className="hidden" />
    </form>
  )
}

type NewThreadModalProps = {
  username: string
  avatar: string | null
}

const NewThreadModal: FunctionComponent<NewThreadModalProps> = ({ username, avatar }) => {
  const { isOpen, modalType, handleOpenChange } = useModal()
  const [state, formAction, isPending] = useActionState(createPost, null)
  const [isValid, setIsValid] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [text, setText] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const noValue = e.target.value.trim() === ''
    setIsValid(!noValue)
  }, [])

  const handleTextInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const t = e.target
    if (t instanceof HTMLTextAreaElement) {
      t.style.height = 'auto' // Reset height
      t.style.height = `${t.scrollHeight}px` // Set to scroll height
    }
    setText(t.value)
  }, [])

  useEffect(() => {
    if (state?.error) {
      toast(state.error)
    } else {
      if (state?.data) {
        router.refresh()
      }
    }
  }, [state, router])

  const handleUploadButtonClick = () => {
    fileInputRef?.current?.click()
  }

  const closeModal = useCallback(() => {
    handleOpenChange(false)
  }, [handleOpenChange])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const optimisticUrl = URL.createObjectURL(file)
      setImage(optimisticUrl)

      const options = { eager: 'c_fit,h_250,w_250', folder: 'threads-clone/avatars', public_id: stringToSafePublicId(username), overwrite: 'true' }

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

      // clearPosts()
      const result = await updateAvatar(data.secure_url)

      if (result.error) {
        setImage(null)
        toast(result.error)
      }

      setImageUrl(data.secure_url)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Prevent default form submission
    const formData = new FormData()
    formData.append('text', text) // Add text
    if (imageUrl) {
      formData.append('image', imageUrl)
    } // Add image URL if it exists
    formAction(formData) // Call formAction with the FormData object
  }

  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog open={isOpen && modalType === 'new-thread'} onOpenChange={handleOpenChange}>
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
              <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">
                New thread
              </DialogTitle>
            </div>
            <div className="h-[0.25px] bg-gray-6"></div>
          </DialogHeader>
          <ModalContent
            state={{ avatar, username, image, text, isValid, isPending, fileInputRef }}
            actions={{ closeModal, handleUploadButtonClick, handleFileChange, handleTextChange, handleTextInput, handleSubmit }}
          />
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open={isOpen && modalType === 'new-thread'} onOpenChange={handleOpenChange}>
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
          <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">
            New thread
          </DialogTitle>
        </DialogHeader>
        <ModalContent
          state={{ isDrawer: true, avatar, text, username, image, fileInputRef, isValid, isPending }}
          actions={{ closeModal, handleUploadButtonClick, handleFileChange, handleTextChange, handleTextInput, handleSubmit }}
        />
      </DrawerContent>
    </Drawer>
  )
}

export default NewThreadModal
