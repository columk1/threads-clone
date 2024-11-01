import type { FunctionComponent } from 'react'

const Caret: FunctionComponent = () => {
  return (
    <svg aria-label="More" role="img" viewBox="0 0 13 12" width="12px" height="12px">
      <title>More</title>
      <path d="m2.5 4.2 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
    </svg>
  )
}

export default Caret
