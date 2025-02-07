'use client'

import type { FunctionComponent } from 'react'

import Button from './Button'

type FollowButtonProps = {
  muted?: boolean
  isFollowed?: boolean
  isFollower?: boolean
  onToggleFollow?: () => Promise<void>
}

const FollowButton: FunctionComponent<FollowButtonProps> = ({
  muted = false,
  isFollowed = false,
  isFollower = false,
  onToggleFollow,
}) => {
  const handleFollow = async () => {
    await (onToggleFollow ? onToggleFollow() : Promise.resolve())
  }
  const variant = isFollowed ? (muted ? 'darkMuted' : 'dark') : 'light'
  const text = isFollowed ? 'Following' : isFollower ? 'Follow back' : 'Follow'
  return (
    <Button onClick={handleFollow} variant={variant} size="sm" className="w-full min-w-28">
      {text}
    </Button>
  )
}

export default FollowButton
