'use client'

import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { type FunctionComponent, useCallback, useState } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { PostUser } from '@/services/users/users.queries'

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'
import EditBioModal from './EditBioModal'
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
          className="min-w-[519px] p-6 dark:bg-primary-bg max-md:hidden"
        >
          <div className="sr-only">
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Edit Profile</DialogDescription>
          </div>
          <div className="flex flex-col gap-3 text-ms">
            {/* Name & Avatar */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="font-semibold">Name</div>
                <div className="">{`${user.name} (@${user.username})`}</div>
                <div className="mt-2.5 h-[0.25px] bg-primary-outline"></div>
              </div>
              <div>
                <ProfileImageDropDown username={user.username} avatarUrl={user.avatar} />
              </div>
            </div>
            {/* Bio */}
            <EditBioModal
              initialBio={user.bio}
              trigger={
                <div className="flex cursor-pointer gap-4">
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="font-semibold">Bio</div>
                    <div className="">
                      {user?.bio ? user.bio : <span className="text-secondary-text">+ Write bio</span>}
                    </div>
                    <div className="my-2 h-[0.25px] bg-primary-outline"></div>
                  </div>
                </div>
              }
            />
            <button
              type="button"
              onClick={closeModal}
              className="h-[52px] w-full rounded-lg border border-primary-outline bg-primary-text font-semibold text-black transition active:scale-95 disabled:opacity-30"
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
        className="h-full min-w-full border-none px-4 dark:bg-secondary-bg"
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
        <div className="-mx-4 h-[0.25px] bg-primary-outline"></div>
        <div className="flex h-full flex-col justify-center">
          <div className="rounded-2xl border-[0.5px] border-primary-outline p-6 dark:bg-primary-bg">
            <div className="flex flex-col gap-3 text-ms">
              {/* Name & Avatar */}
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="font-semibold">Name</div>
                  <div className="">{`${user.name} (@${user.username})`}</div>
                  <div className="mt-2.5 h-[0.25px] bg-primary-outline"></div>
                </div>
                <div>
                  <ProfileImageDropDown username={user.username} avatarUrl={user.avatar} />
                </div>
              </div>
              {/* Bio */}
              <EditBioModal
                initialBio={user.bio}
                trigger={
                  <div className="flex cursor-pointer gap-4">
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="font-semibold">Bio</div>
                      <div className="">
                        {user?.bio ? user.bio : <span className="text-secondary-text">+ Write bio</span>}
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default ProfileModal
