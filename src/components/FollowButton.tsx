'use client'

import cx from 'clsx'
import type { FunctionComponent } from 'react'

import { useModal } from '@/hooks/useModal'

type FollowButtonProps = {
  variant?: 'light' | 'dark'
  isAuthenticated?: boolean
  isFollowed?: boolean
  onToggleFollow?: () => Promise<void>
}

const FollowButton: FunctionComponent<FollowButtonProps> = ({
  variant = 'light',
  isAuthenticated = false,
  isFollowed,
  onToggleFollow,
}) => {
  const { openModal } = useModal()

  const handleFollow = async () => {
    if (!isAuthenticated) {
      openModal('auth-prompt', 'follow')
      return
    }
    await (onToggleFollow ? onToggleFollow() : Promise.resolve())
  }
  return (
    <button
      type="button"
      onClick={handleFollow}
      className={cx(
        'w-full h-9 rounded-lg border border-gray-5 px-4 min-w-28 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30',
        !isFollowed && variant !== 'dark' ? 'bg-white text-black' : 'text-gray-7',
      )}
    >
      {isFollowed ? 'Following' : 'Follow'}
    </button>
  )
}

export default FollowButton
