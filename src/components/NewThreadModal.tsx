import { Description } from '@radix-ui/react-dialog'
import { type FunctionComponent, use, useCallback, useState } from 'react'

import { ModalContext } from '@/context/ModalContext'

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './Dialog'

type NewThreadModalProps = {
  user?: any
}

const NewThreadModal: FunctionComponent<NewThreadModalProps> = () => {
  const { isOpen, setIsOpen } = use(ModalContext)
  const [isValid, setIsValid] = useState(false)

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const noValue = e.target.value.trim() === ''
    setIsValid(!noValue)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Description>Create a new thread</Description>
      <DialogContent>
        <DialogHeader className="grid h-14 grid-cols-[minmax(64px,100px)_minmax(0,1fr)_minmax(64px,100px)]">
          <DialogClose asChild>
            <div className="flex items-center justify-center">
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg py-1 text-[17px]">
                <span className="sr-only">Close</span>
                Cancel
              </button>
            </div>
          </DialogClose>
          <DialogTitle className="col-start-2 place-self-center text-[16px] font-bold">
            New thread
          </DialogTitle>
        </DialogHeader>
        <form action="/api/threads" method="post">
          <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-y-[3px] text-[15px]">
            <div className="col-start-1 row-start-1 row-end-[span_2] pt-1 ">
              <div className="size-9 rounded-full bg-gray-7"></div>
            </div>
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="font-semibold">
                  {/* { row.user.username } */}
                  columk1
                </div>
              </div>
            </div>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input type="text" autoComplete="off" autoFocus onChange={handleInput} name="text" placeholder="What's new?" minLength={1} className="col-start-2 mb-[2px] bg-transparent placeholder:text-gray-7 focus:outline-none focus:ring-0" />
          </div>
          <DialogFooter>
            <div className="flex items-center justify-between pt-6 text-[15px] text-gray-7">
              Anyone can reply & quote
              <button type="submit" disabled={!isValid} className="ml-auto h-9 rounded-lg border border-gray-5 px-4 font-semibold text-primary-text transition active:scale-95 disabled:opacity-30">
                Post
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewThreadModal
