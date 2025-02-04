'use client'

import type { FunctionComponent } from 'react'

import Button from './Button'

type FollowButtonProps = {
  muted?: boolean
  isFollowed?: boolean
  isNotification?: boolean
  onToggleFollow?: () => Promise<void>
}

const FollowButton: FunctionComponent<FollowButtonProps> = ({
  muted = false,
  isFollowed,
  isNotification = false,
  onToggleFollow,
}) => {
  const handleFollow = async () => {
    await (onToggleFollow ? onToggleFollow() : Promise.resolve())
  }
  const variant = isFollowed ? (muted ? 'darkMuted' : 'dark') : 'light'
  const text = isFollowed ? 'Following' : `Follow ${isNotification ? 'back' : ''}`
  return (
    <Button onClick={handleFollow} variant={variant} size="sm" className="w-full min-w-28">
      {text}
    </Button>
  )
}

export default FollowButton
