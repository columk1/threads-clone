'use client'

import cx from 'clsx'
import { type FunctionComponent, startTransition, useOptimistic } from 'react'

type FollowButtonProps = {
  isFollowed: boolean
  onToggleFollow: () => Promise<void>
}

const FollowButton: FunctionComponent<FollowButtonProps> = ({ isFollowed, onToggleFollow }) => {
  const [optimisticIsFollowed, addOptimisticIsFollowed] = useOptimistic(
    isFollowed,
    (_, optimisticValue: boolean) => optimisticValue,
  )

  const handleToggleFollow = async () => {
    startTransition(() => {
      addOptimisticIsFollowed(!optimisticIsFollowed)
    })
    await onToggleFollow()
  }

  return (
    <button
      type="button"
      onClick={handleToggleFollow}
      className={cx(
        'w-full h-9 rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30',
        !optimisticIsFollowed ? 'bg-white text-black' : 'text-primary-text',
      )}
    >
      {optimisticIsFollowed ? 'Unfollow' : 'Follow'}
    </button>
  )
}

export default FollowButton
