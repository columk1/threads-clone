import cx from 'clsx'
import Image from 'next/image'
import type { FunctionComponent } from 'react'

import { FollowIcon } from './icons'

type AvatarProps = {
  url: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isFollowed?: boolean
  className?: string
}

const sizeClass = {
  sm: 'size-9',
  md: 'size-[52px]',
  lg: 'size-16',
  xl: 'size-[84px]',
}

// Used for dynamic Image component sizing (likely better to have one size for all images)
// const sizePx = {
//   sm: 36,
//   md: 52,
//   lg: 64,
//   xl: 84,
// }

const Avatar: FunctionComponent<AvatarProps> = ({ size = 'sm', url, isFollowed, className }) => {
  return (
    <div
      className={cx(
        `relative size-bg-gray-1 rounded-full outline outline-[0.5px] outline-offset-[0.5px] outline-primary-outline border-white/20 ${className}`,
        sizeClass[size],
        { 'lg:size-[84px]': size === 'lg' }, // Scale lg up to xl on large screens
      )}
    >
      <div className="inline-block overflow-hidden rounded-full">
        <Image
          src={url || '/assets/images/placeholder.svg'}
          width={84}
          height={84}
          alt="Avatar"
          className="aspect-square object-cover text-xs"
        />
      </div>
      {isFollowed === false ? (
        <span className="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full bg-white text-gray-1 outline outline-2 outline-gray-1">
          <FollowIcon />
        </span>
      ) : null}
    </div>
  )
}

export default Avatar
