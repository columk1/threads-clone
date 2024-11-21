import type { FunctionComponent } from 'react'

const Close: FunctionComponent = () => {
  return (
    <svg aria-label="Close button" role="img" viewBox="0 0 24 24" height="16px" width="16px" strokeWidth="2"stroke="currentColor">
      <title>Close button</title>
      <line x1="21" x2="3" y1="3" y2="21"></line>
      <line x1="21" x2="3" y1="21" y2="3"></line>
    </svg>
  )
}

export default Close
