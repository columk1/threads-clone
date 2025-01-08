'use client'

import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { type FunctionComponent, useCallback, useState } from 'react'

import type { PostUser } from '@/app/actions'
import { useMediaQuery } from '@/hooks/useMediaQuery'

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'
import ProfileImageDropDown from './ProfileImageDropDown'

type ProfileModalProps = {
  user: PostUser
  trigger: React.ReactNode
}

const ProfileModal: FunctionComponent<ProfileModalProps> = ({ user, trigger }) => {
  const [open, setOpen] = useState(false)

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const isDesktop = useMediaQuery('(min-width: 700px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="min-w-[519px] p-6 dark:bg-gray-1 max-md:hidden"
        >
          <div className="sr-only">
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Edit Profile</DialogDescription>
          </div>
          <div className="flex flex-col gap-3 text-[15px]">
            {/* Name & Avatar */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="font-semibold">Name</div>
                <div className="">{`${user.name} (@${user.username})`}</div>
                <div className="mt-2.5 h-[0.25px] bg-gray-6"></div>
              </div>
              <div>
                <ProfileImageDropDown username={user.username} avatarUrl={user.avatar} />
              </div>
            </div>
            {/* Bio */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="font-semibold">Bio</div>
                {/* TODO: Wrap in button to open edit bio modal */}
                <div className="">{user?.bio ? user.bio : <span className="text-gray-7">+ Write bio</span>}</div>
                <div className="my-2 h-[0.25px] bg-gray-6"></div>
              </div>
            </div>
            <button
              type="button"
              onClick={closeModal}
              className="h-[52px] w-full rounded-lg border border-gray-5 bg-primary-text font-semibold text-black transition active:scale-95 disabled:opacity-30"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DrawerContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="h-full min-w-full border-none px-4 dark:bg-gray-0"
      >
        <div className="sr-only">
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Edit Profile</DialogDescription>
        </div>
        <DialogHeader className="flex h-[50px] flex-row items-center justify-between">
          <DialogClose asChild>
            <div className="flex">
              <button type="button" onClick={closeModal} className="rounded-lg py-1 text-[17px]">
                <span className="sr-only">Close</span>
                Cancel
              </button>
            </div>
          </DialogClose>
          <DialogTitle className="text-[16px] font-bold">Edit Profile</DialogTitle>
          <button
            type="button"
            onClick={closeModal}
            className="text-[17px] font-semibold text-primary-text transition active:scale-95 disabled:opacity-30"
          >
            Done
          </button>
        </DialogHeader>
        <div className="-mx-4 h-[0.25px] bg-gray-6"></div>
        <div className="flex h-full flex-col justify-center">
          <div className="rounded-2xl border-[0.5px] border-gray-5 p-6 dark:bg-gray-1">
            <div className="flex flex-col gap-3 text-[15px]">
              {/* Name & Avatar */}
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="font-semibold">Name</div>
                  <div className="">{`${user.name} (@${user.username})`}</div>
                  <div className="mt-2.5 h-[0.25px] bg-gray-6"></div>
                </div>
                <div>
                  <ProfileImageDropDown username={user.username} avatarUrl={user.avatar} />
                </div>
              </div>
              {/* Bio */}
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="font-semibold">Bio</div>
                  {/* TODO: Wrap in button to open edit bio modal */}
                  <div className="">{user?.bio ? user.bio : <span className="text-gray-7">+ Write bio</span>}</div>
                  {/* <div className="mt-2.5 h-[0.25px] bg-gray-6"></div> */}
                </div>
                <div className=""></div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ProfileModal
