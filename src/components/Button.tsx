'use client'

import type { FunctionComponent } from 'react'

import { baseButtonStyles, cn } from '@/components/ui/utils'

type ButtonVariant = 'light' | 'dark' | 'darkMuted'
type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonWidth = 'auto' | 'full' | 'fixed'

type ButtonProps = {
  className?: string
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  size?: ButtonSize
  width?: ButtonWidth
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

const buttonVariants = {
  base: baseButtonStyles,
  variant: {
    light: 'bg-white text-black',
    dark: 'text-white',
    darkMuted: 'text-gray-7',
  },
  size: {
    sm: 'h-9',
    md: 'py-2 px-4',
    lg: 'py-3 px-4',
  },
  width: {
    auto: '',
    full: 'w-full',
    fixed: 'min-w-28',
  },
}

const Button: FunctionComponent<ButtonProps> = ({
  className,
  type = 'button',
  variant = 'light',
  size = 'sm',
  width = 'auto',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        buttonVariants.base,
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        buttonVariants.width[width],
        className,
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
