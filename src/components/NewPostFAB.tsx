'use client'

import type { FunctionComponent } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'

import { CreateIcon } from './icons'
import PostButton from './PostButton'

const NewPostFAB: FunctionComponent = () => {
  const isDesktop = useMediaQuery('(min-width: 700px)')
  if (!isDesktop) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 flex h-[67px] w-[81px] items-center justify-center delay-200 duration-300 animate-in fade-in-0 zoom-in-75 starting:opacity-0 max-md:hidden">
      <PostButton className="size-full">
        <div className="flex size-full items-center justify-center rounded-2xl border-[0.5px] border-primary-outline bg-elevated-bg text-primary-text transition duration-200 hover:scale-110 active:scale-95">
          <CreateIcon />
        </div>
      </PostButton>
    </div>
  )
}

export default NewPostFAB
