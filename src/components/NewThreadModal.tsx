'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { type FunctionComponent, useActionState, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { createPost } from '@/app/actions'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useModal } from '@/hooks/useModal'

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'

type NewThreadModalProps = {
  username?: string
}

const NewThreadModal: FunctionComponent<NewThreadModalProps> = ({ username }) => {
  const { isOpen, modalType, handleOpenChange } = useModal()
  const [state, formAction, isPending] = useActionState(createPost, null)
  const [isValid, setIsValid] = useState(false)

  const router = useRouter()

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const noValue = e.target.value.trim() === ''
    setIsValid(!noValue)
  }, [])

  const closeModal = useCallback(() => {
    handleOpenChange(false)
  }, [handleOpenChange])

  useEffect(() => {
    if (state?.error) {
      toast(state.error)
    } else {
      if (state?.data) {
        router.refresh()
      }
    }
  }, [state, router])

  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog open={isOpen && modalType === 'new-thread'} onOpenChange={handleOpenChange}>
        <DialogContent className="min-w-[620px] max-md:hidden">
          <div className="sr-only">
            <DialogDescription>Create a new thread</DialogDescription>
          </div>
          <DialogHeader className="grid h-14 grid-cols-[minmax(64px,100px)_minmax(0,1fr)_minmax(64px,100px)]">
            <DialogClose asChild>
              <div className="flex items-center justify-center">
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
          <form action={formAction}>
            <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px] text-[15px]">
              <div className="col-start-1 row-start-1 row-end-[span_2] pt-1 ">
                <div className="size-9 rounded-full bg-gray-7"></div>
              </div>
              <div className="flex w-full items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {username}
                  </div>
                </div>
              </div>
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input type="text" autoComplete="off" autoFocus onChange={handleInput} name="text" placeholder="What's new?" minLength={1} className="col-start-2 mb-[2px] bg-transparent placeholder:text-gray-7 focus:outline-none focus:ring-0" />
            </div>
            <div className="flex items-center justify-between pt-6 text-[15px] text-gray-7">
              Anyone can reply & quote
              <button type="submit" onClick={closeModal} disabled={!isValid || isPending} className="ml-auto h-9 rounded-lg border border-gray-5 px-4 font-semibold text-primary-text transition active:scale-95 disabled:opacity-30">
                Post
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
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
        <form action={formAction} className="flex h-[calc(100%-56px)] w-full flex-col justify-between">
          <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px] pt-3 text-[15px]">
            <div className="col-start-1 row-start-1 row-end-[span_2] pt-1 ">
              <div className="size-9 rounded-full bg-gray-7"></div>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {username}
                </div>
              </div>
            </div>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input type="text" autoComplete="off" autoFocus onChange={handleInput} name="text" placeholder="What's new?" minLength={1} className="col-start-2 mb-[2px] bg-transparent placeholder:text-gray-7 focus:outline-none focus:ring-0" />
          </div>
          <div className="mx-auto flex items-center justify-between gap-4 text-[15px] text-gray-7">
            Anyone can reply & quote
            <button type="submit" onClick={closeModal} disabled={!isValid || isPending} className="ml-auto h-9 rounded-2xl bg-primary-text px-4 font-semibold text-gray-0 transition active:scale-95 disabled:opacity-30">
              Post
            </button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

export default NewThreadModal
