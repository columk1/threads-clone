import type { FunctionComponent } from 'react'

type ContinueProps = {
  className?: string
}

const Continue: FunctionComponent<ContinueProps> = ({ className }) => {
  return (
    <svg
      aria-label="Continue"
      role="img"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      width="16px"
      height="16px"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <title>Continue</title>
      <polyline points="7.498 3 16.502 12 7.498 21"></polyline>
    </svg>
  )
}

export default Continue
