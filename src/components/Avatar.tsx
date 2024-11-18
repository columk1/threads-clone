import cx from 'clsx'
import type { FunctionComponent } from 'react'

type AvatarProps = {
  url?: string
  size?: 'sm' | 'md'
  className?: string
}

const Avatar: FunctionComponent<AvatarProps> = ({ size = 'sm', className }) => {
  const sizeClasses = cx({
    'size-9': size === 'sm',
    'size-16': size === 'md',
  })

  return (
    <div className={cx(`rounded-full bg-gray-7 ${className}`, sizeClasses)}></div>
  )
}

export default Avatar
