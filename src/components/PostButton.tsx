'use client'

import type { FunctionComponent } from 'react'

import { useModal } from '@/hooks/useModal'

type PostButtonProps = {
  className?: string
  children: React.ReactNode
}

const PostButton: FunctionComponent<PostButtonProps> = ({ className, children }) => {
  const { openModal } = useModal()

  return (
    <button type="button" onClick={() => openModal('new-thread')} className={className}>
      {children}
    </button>
  )
}

export default PostButton
