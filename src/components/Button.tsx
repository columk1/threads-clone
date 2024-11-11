'use client'

import type { FunctionComponent } from 'react'

type ButtonProps = {
  className?: string
  onClick?: () => void
  children: React.ReactNode
}

const Button: FunctionComponent<ButtonProps> = ({ className, onClick, children }) => {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
