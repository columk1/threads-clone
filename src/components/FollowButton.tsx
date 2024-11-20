'use client'

import cx from 'clsx'
import type { FunctionComponent } from 'react'

type FollowButtonProps = {
  isFollowed: boolean
  onToggleFollow: () => Promise<void>
}

const FollowButton: FunctionComponent<FollowButtonProps> = ({ isFollowed, onToggleFollow }) => {
  return (
    <button
      type="button"
      onClick={onToggleFollow}
      className={cx(
        'w-full h-9 rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30',
        !isFollowed ? 'bg-white text-black' : 'text-primary-text',
      )}
    >
      {isFollowed ? 'Unfollow' : 'Follow'}
    </button>
  )
}

export default FollowButton
