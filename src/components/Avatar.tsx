import cx from 'clsx'
import Image from 'next/image'
import type { FunctionComponent } from 'react'

import { FollowIcon } from './icons'

type AvatarProps = {
  url?: string
  size?: 'sm' | 'md'
  imageUrl?: string
  isFollowed?: boolean
  className?: string
}

const sizeClass = {
  sm: 'size-9',
  md: 'size-16',
}

const sizePx = {
  sm: 36,
  md: 64,
}

const Avatar: FunctionComponent<AvatarProps> = ({ size = 'sm', imageUrl, isFollowed, className }) => {
  return (
    <div className={cx(`relative bg-gray-1 rounded-full outline outline-[0.5px] outline-offset-[0.5px] outline-primary-outline border-white/20 ${className}`, sizeClass[size])}>
      <div className="inline-block overflow-hidden rounded-full">
        <Image
          src={imageUrl || '/assets/images/placeholder.svg'}
          width={sizePx[size]}
          height={sizePx[size]}
          alt="Avatar"
          className="aspect-square object-cover text-xs"
        />
      </div>
      {isFollowed === false
        ? (
            <span className="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full bg-white text-gray-1 outline outline-2 outline-gray-1">
              <FollowIcon />
            </span>
          )
        : null}
    </div>
  )
}

export default Avatar
