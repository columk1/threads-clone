import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import cx from 'clsx'
import { type FunctionComponent, useActionState, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { BIO_CHARACTER_LIMIT } from '@/lib/constants'
import { updateBio } from '@/services/users/users.actions'
import { isTextWithinRange } from '@/utils/string/isWithinRange'

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'

type EditBioModalProps = {
  initialBio: string | null
  trigger: React.ReactNode
}

const EditBioForm = ({ isDrawer, initialBio }: { isDrawer: boolean; initialBio: string | null }) => {
  const [state, formAction, isPending] = useActionState(updateBio, null)
  const [bio, setBio] = useState(initialBio ?? '')
  const formRef = useRef<HTMLFormElement>(null)
  const isValid = isTextWithinRange(bio, BIO_CHARACTER_LIMIT)

  const adjustTextareaHeight = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [])

  const handleTextInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setBio(e.target.value)
      adjustTextareaHeight(e.target)
    },
    [adjustTextareaHeight],
  )

  const textInputRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      const length = node.value.length
      node.setSelectionRange(length, length)
      setTimeout(() => {
        node.focus()
      }, 0)
    }
  }, [])

  const handleSubmit = () => {
    formRef.current?.requestSubmit()
  }

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state?.error])

  return (
    <>
      <DialogHeader>
        <div
          className={cx(
            'grid h-14 grid-cols-[minmax(64px,100px)_minmax(0,1fr)_minmax(64px,100px)]',
            !isDrawer && 'px-6',
          )}
        >
          <DialogClose asChild>
            <div className="flex">
              <button type="button" className="rounded-lg py-1 text-[17px]">
                Cancel
              </button>
            </div>
          </DialogClose>
          <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">Edit Bio</DialogTitle>
          <div className="sr-only">
            <DialogDescription>Edit bio</DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-right text-[17px] font-semibold text-primary-text transition active:scale-95 disabled:opacity-30"
              disabled={isPending}
            >
              Done
            </button>
          </DialogClose>
        </div>
        <div className={cx('h-[0.25px] bg-gray-5', isDrawer && '-mx-6')}></div>
      </DialogHeader>
      <div className={cx('flex h-full flex-col p-6', isDrawer && 'max-h-[calc(100vh-56px)] px-0')}>
        <form ref={formRef} action={formAction} className="flex-1">
          <label htmlFor="bio" className="sr-only">
            Bio
          </label>
          <textarea
            ref={textInputRef}
            id="bio"
            name="bio"
            autoComplete="off"
            minLength={1}
            className="mb-[2px] min-h-[120px] w-full resize-none bg-transparent placeholder:text-gray-7 focus:outline-none focus:ring-0"
            rows={1}
            value={bio}
            placeholder="Write a bio..."
            maxLength={BIO_CHARACTER_LIMIT}
            onInput={handleTextInput}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isValid && !isPending) {
                handleSubmit()
              }
            }}
          />
        </form>
        <div className="pb-3 text-[13px] text-gray-7">Your bio is public.</div>
        <div className="h-[0.25px] bg-gray-5"></div>
      </div>
    </>
  )
}

const EditBioModal: FunctionComponent<EditBioModalProps> = ({ initialBio, trigger }) => {
  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="min-w-[620px] max-md:hidden">
          <EditBioForm isDrawer={false} initialBio={initialBio} />
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DrawerContent className="h-full min-w-full border-none">
        <EditBioForm isDrawer initialBio={initialBio} />
      </DrawerContent>
    </Drawer>
  )
}

export default EditBioModal
