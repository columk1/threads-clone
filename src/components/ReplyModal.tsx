'use client'

import { DialogDescription } from '@radix-ui/react-dialog'
import type { User } from 'lucia'
import { useRouter } from 'next/navigation'
import { type FunctionComponent, useActionState, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { createReply, type PostUser } from '@/app/actions'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Post } from '@/models/Schema'

import Avatar from './Avatar'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './Dialog'
import { Drawer, DrawerContent } from './Drawer'
import { ImageIcon } from './icons'

type ReplyModalProps = {
  author: PostUser
  post: Post
  user: User
  trigger: React.ReactNode
}

const ReplyModal: FunctionComponent<ReplyModalProps> = ({ author, post, user, trigger }) => {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(createReply, null)
  const [isValid, setIsValid] = useState(false)

  const router = useRouter()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const noValue = e.target.value.trim() === ''
    setIsValid(!noValue)
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target instanceof HTMLTextAreaElement) {
      e.target.style.height = 'auto' // Reset height
      e.target.style.height = `${e.target.scrollHeight}px` // Set to scroll height
    }
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent onOpenAutoFocus={e => e.preventDefault()} className="min-w-[620px] max-md:hidden">
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
              <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">
                Reply
              </DialogTitle>
            </div>
            <div className="h-[0.25px] bg-gray-6"></div>
          </DialogHeader>
          <form action={formAction}>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="px-6 pb-1 pt-2">

                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute bottom-1.5 left-[17px] top-[50px] w-[2px] bg-gray-5"></div>

                  {/* Content */}
                  <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px] text-[15px]">
                    <div className="col-start-1 row-start-1 row-end-[span_2] pt-1">
                      <Avatar size="sm" url={author.avatar} />
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{author.username}</div>
                      </div>
                    </div>
                    <div className="">{post.text}</div>
                  </div>
                  {/* Media Section */}
                  <div className="flex pl-12 text-gray-7">
                    {/* Image */}
                    <div className="flex-1">
                      {post.image && (
                        <div className="mb-1 mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.image}
                            alt="preview"
                            className="max-h-[430px] rounded-lg bg-white object-contain"
                          />
                        </div>
                      )}
                      <div
                        className="flex h-6 items-center justify-start"
                      >
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  {/* Vertical Line - uncomment for multiple replies in thread feature */}
                  {/* <div className="absolute bottom-1.5 left-[17px] top-[50px] w-[2px] bg-gray-5"></div> */}
                  <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px] text-[15px]">
                    <div className="col-start-1 row-start-1 row-end-[span_2] pt-1 ">
                      <Avatar size="sm" url={user.avatar} />
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">
                          {user.username}
                        </div>
                      </div>
                    </div>
                    {/* Multi-line Input */}
                    <textarea
                      autoComplete="off"
                      // eslint-disable-next-line jsx-a11y/no-autofocus
                      autoFocus
                      onChange={handleChange}
                      name="text"
                      placeholder="What's new?"
                      minLength={1}
                      className="col-start-2 mb-[2px] w-full resize-none bg-transparent placeholder:text-gray-7 focus:outline-none focus:ring-0"
                      rows={1} // Starts with 1 line
                      onInput={handleInput}
                    >
                    </textarea>
                    <input type="hidden" name="parentId" value={post.id} />
                  </div>
                  {/* Media Section */}
                  <div className="flex pl-12 text-gray-7">
                    {/* Image and Add Media Button */}
                    <div className="flex-1">
                      {post.image && (
                        <div className="mb-1 mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.image}
                            alt="preview"
                            className="max-h-[430px] rounded-lg bg-white object-contain"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        // onClick={(handleUploadButtonClick)}
                        className="mt-2 flex h-9 items-center justify-start transition active:scale-85"
                      >
                        <ImageIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 text-[15px] text-gray-7">
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DrawerContent onOpenAutoFocus={e => e.preventDefault()} className="h-full min-w-full border-none">
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
          <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">
            Reply
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex h-[calc(100%-56px)] w-full flex-col justify-between pt-3">
          <div className="overflow-y-auto">
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute bottom-1.5 left-[17px] top-[50px] w-[2px] bg-gray-5"></div>

              {/* Content */}
              <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px] text-[15px]">
                <div className="col-start-1 row-start-1 row-end-[span_2] pt-1">
                  <Avatar size="sm" url={author.avatar} />
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{author.username}</div>
                  </div>
                </div>
                <div className="">{post.text}</div>
              </div>
              {/* Media Section */}
              <div className="flex pl-12 text-gray-7">
                {/* Image */}
                <div className="flex-1">
                  {post.image && (
                    <div className="mb-1 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt="preview"
                        className="max-h-[430px] rounded-lg bg-white object-contain"
                      />
                    </div>
                  )}
                  <div
                    className="flex h-6 items-center justify-start"
                  >
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Vertical Line - uncomment for multiple replies in thread feature */}
              {/* <div className="absolute bottom-1.5 left-[17px] top-[50px] w-[2px] bg-gray-5"></div> */}
              <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px] text-[15px]">
                <div className="col-start-1 row-start-1 row-end-[span_2] pt-1 ">
                  <Avatar size="sm" url={user.avatar} />
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">
                      {user.username}
                    </div>
                  </div>
                </div>
                {/* Multi-line Input */}
                <textarea
                  autoComplete="off"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  onChange={handleChange}
                  name="text"
                  placeholder="What's new?"
                  minLength={1}
                  className="col-start-2 mb-[2px] w-full resize-none bg-transparent placeholder:text-gray-7 focus:outline-none focus:ring-0"
                  rows={1} // Starts with 1 line
                  onInput={handleInput}
                >
                </textarea>
                <input type="hidden" name="parentId" value={post.id} />
              </div>
              {/* Media Section */}
              <div className="flex pl-12 text-gray-7">
                {/* Image and Add Media Button */}
                <div className="flex-1">
                  {post.image && (
                    <div className="mb-1 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt="preview"
                        className="max-h-[430px] rounded-lg bg-white object-contain"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    // onClick={(handleUploadButtonClick)}
                    className="mt-2 flex h-9 items-center justify-start transition active:scale-85"
                  >
                    <ImageIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 text-[15px] text-gray-7">
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

export default ReplyModal
