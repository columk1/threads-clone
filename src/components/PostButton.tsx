'use client'

import { type FunctionComponent, use } from 'react'

import Button from '@/components/Button'
import { ModalContext } from '@/context/ModalContext'

type PostButtonProps = {
  className?: string
  children: React.ReactNode
}

const PostButton: FunctionComponent<PostButtonProps> = ({ className, children }) => {
  const { setIsOpen } = use(ModalContext)

  return (
    <Button onClick={() => setIsOpen(true)} className={className}>
      {children}
    </Button>
  )
}

export default PostButton
