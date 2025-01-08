import type { FunctionComponent } from 'react'

const ReplyColor: FunctionComponent = () => {
  return (
    <svg aria-label="Reply" role="img" viewBox="0 0 41 40" width="48px" height="48px" fill="transparent">
      <title>Comment</title>
      <path
        clipRule="evenodd"
        d="M34.6688 28.2615L36.6913 36.2122L28.7457 34.1884C28.6735 34.1884 28.529 34.1884 28.4568 34.1884C25.7842 35.7063 22.6059 36.4291 19.211 36.2122C11.4821 35.634 5.12559 29.418 4.33103 21.6841C3.31978 11.4204 11.9155 2.81918 22.1725 3.83109C29.9014 4.62616 36.1135 10.9145 36.6913 18.7206C36.9803 22.1178 36.1857 25.2981 34.6688 27.9724C34.6688 28.117 34.6688 28.1892 34.6688 28.2615Z"
        fillRule="evenodd"
        stroke="url(#paint0_linear_4272_8415)"
        strokeLinejoin="round"
        strokeWidth="3.33333"
      ></path>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_4272_8415"
          x1="4.25"
          x2="36.75"
          y1="36.25"
          y2="3.75"
        >
          <stop stopColor="#FFD600"></stop>
          <stop offset="0.239583" stopColor="#FF7A00"></stop>
          <stop offset="0.489583" stopColor="#FF0069"></stop>
          <stop offset="0.75" stopColor="#D300C5"></stop>
          <stop offset="1" stopColor="#7638FA"></stop>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default ReplyColor
