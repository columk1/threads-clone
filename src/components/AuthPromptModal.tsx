'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import { type FunctionComponent, useCallback } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getAuthModalContent, useModal } from '@/hooks/useModal'

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'
import FacebookAuthButton from './FacebookAuthButton'
import { CloseIcon } from './icons'

type AuthPromptModalProps = {
  username?: string
}

const AuthPromptModal: FunctionComponent<AuthPromptModalProps> = () => {
  const { isOpen, modalType, protectedAction, handleOpenChange } = useModal()
  const { title, caption, icon: Icon } = getAuthModalContent(protectedAction)

  const closeModal = useCallback(() => {
    handleOpenChange(false)
  }, [handleOpenChange])

  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog open={isOpen && modalType === 'auth-prompt'} onOpenChange={handleOpenChange}>
        <DialogContent className="flex w-[520px] flex-col items-center justify-center gap-8 border-none px-14 pb-14 pt-12 dark:bg-gray-1 max-md:hidden">
          <div className="flex flex-col items-center gap-1">
            {Icon && <Icon className="mb-2" />}
            <DialogTitle className="flex place-self-center text-3xl font-bold">{title}</DialogTitle>
            <DialogDescription className="w-[21rem] text-center text-[15px] text-gray-8">{caption}</DialogDescription>
          </div>
          <FacebookAuthButton iconSize="45" className="h-20">
            Log in with Facebook
          </FacebookAuthButton>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={isOpen && modalType === 'auth-prompt'} onOpenChange={handleOpenChange}>
      <DrawerContent className="min-w-full p-6 dark:bg-gray-1">
        <DialogHeader className="grid h-9 grid-cols-[minmax(64px,100px)_minmax(0,1fr)_minmax(64px,100px)]">
          <DialogClose asChild>
            <div className="flex">
              <button
                type="button"
                onClick={closeModal}
                className="flex w-9 items-center justify-center rounded-lg text-[17px] text-gray-8"
              >
                <span className="sr-only">Close</span>
                <CloseIcon />
              </button>
            </div>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            {Icon && <Icon className="mb-1 size-10" />}
            <DialogTitle className="flex place-self-center text-2xl font-bold">{title}</DialogTitle>
            <DialogDescription className="w-[21rem] text-center text-[15px] text-gray-8">{caption}</DialogDescription>
          </div>
          <FacebookAuthButton iconSize="45" className="h-20">
            Log in with Facebook
          </FacebookAuthButton>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default AuthPromptModal
