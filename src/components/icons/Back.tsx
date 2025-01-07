import type { FunctionComponent } from 'react'

type BackProps = {
  size?: 'sm' | 'md'
  className?: string
}

const Back: FunctionComponent<BackProps> = ({ size = 'sm', className }) => {
  const sizePx = {
    sm: 12,
    md: 20,
  }
  const stroke = {
    sm: 1.5,
    md: 1,
  }

  return (
    <svg
      aria-label="Back"
      role="img"
      viewBox="0 0 12 12"
      fill="currentColor"
      height={sizePx[size]}
      width={sizePx[size]}
      className={className}
    >
      <title>Back</title>
      <path
        d="M1 6h10M1 6l4-4M1 6l4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={stroke[size]}
      ></path>
    </svg>
  )
}

export default Back
