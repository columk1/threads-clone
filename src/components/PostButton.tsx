'use client'

import type { FunctionComponent } from 'react'

import Button from '@/components/Button'
import { useModal } from '@/hooks/useModal'

type PostButtonProps = {
  className?: string
  children: React.ReactNode
}

const PostButton: FunctionComponent<PostButtonProps> = ({ className, children }) => {
  const { openModal } = useModal()

  return (
    <Button onClick={() => openModal('new-thread')} className={className}>
      {children}
    </Button>
  )
}

export default PostButton
