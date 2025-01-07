import type { FunctionComponent } from 'react'

const Checkmark: FunctionComponent = () => {
  return (
    <svg
      aria-label="Checkmark: selected"
      role="img"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="3"
      height="16px"
      width="16px"
    >
      <title>Checkmark: selected</title>
      <polyline points="21.648 5.352 9.002 17.998 2.358 11.358"></polyline>
    </svg>
  )
}

export default Checkmark
