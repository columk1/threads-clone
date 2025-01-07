import type { FunctionComponent } from 'react'

type ShareProps = {
  className?: string
  liked?: boolean
}

const Share: FunctionComponent<ShareProps> = ({ className }) => {
  return (
    <svg
      aria-label="Share"
      role="img"
      viewBox="0 0 18 18"
      height="18px"
      width="18px"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      <title>Share</title>
      <path d="M15.6097 4.09082L6.65039 9.11104" strokeLinejoin="round" strokeWidth="1.25"></path>
      <path
        d="M7.79128 14.439C8.00463 15.3275 8.11131 15.7718 8.33426 15.932C8.52764 16.071 8.77617 16.1081 9.00173 16.0318C9.26179 15.9438 9.49373 15.5501 9.95761 14.7628L15.5444 5.2809C15.8883 4.69727 16.0603 4.40546 16.0365 4.16566C16.0159 3.95653 15.9071 3.76612 15.7374 3.64215C15.5428 3.5 15.2041 3.5 14.5267 3.5H3.71404C2.81451 3.5 2.36474 3.5 2.15744 3.67754C1.97758 3.83158 1.88253 4.06254 1.90186 4.29856C1.92415 4.57059 2.24363 4.88716 2.88259 5.52032L6.11593 8.7243C6.26394 8.87097 6.33795 8.94431 6.39784 9.02755C6.451 9.10144 6.4958 9.18101 6.53142 9.26479C6.57153 9.35916 6.59586 9.46047 6.64451 9.66309L7.79128 14.439Z"
        strokeLinejoin="round"
        strokeWidth="1.25"
      ></path>
    </svg>
  )
}

export default Share
