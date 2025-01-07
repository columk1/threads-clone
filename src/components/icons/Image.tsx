import type { FunctionComponent } from 'react'

type ImageProps = {
  className?: string
}

const Image: FunctionComponent<ImageProps> = ({ className }) => {
  return (
    <svg
      aria-label="Attach media"
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      height="20px"
      width="20px"
    >
      <title>Attach media</title>
      <g>
        <path
          clipRule="evenodd"
          d="M2.00207 9.4959C1.65132 7.00019 1.47595 5.75234 1.82768 4.73084C2.13707 3.83231 2.72297 3.05479 3.50142 2.50971C4.38639 1.89005 5.63425 1.71467 8.12996 1.36392L10.7047 1.00207C13.2004 0.651325 14.4482 0.47595 15.4697 0.827679C16.3682 1.13707 17.1458 1.72297 17.6908 2.50142C17.9171 2.82454 18.0841 3.19605 18.2221 3.65901C17.7476 3.64611 17.2197 3.64192 16.6269 3.64055C16.5775 3.5411 16.5231 3.44881 16.4621 3.36178C16.0987 2.84282 15.5804 2.45222 14.9814 2.24596C14.3004 2.01147 13.4685 2.12839 11.8047 2.36222L7.44748 2.97458C5.78367 3.20841 4.95177 3.32533 4.36178 3.73844C3.84282 4.10182 3.45222 4.62017 3.24596 5.21919C3.01147 5.90019 3.12839 6.73209 3.36222 8.3959L3.97458 12.7531C4.15588 14.0431 4.26689 14.833 4.50015 15.3978C4.50083 16.3151 4.50509 17.0849 4.53201 17.7448C4.13891 17.4561 3.79293 17.1036 3.50971 16.6991C2.89005 15.8142 2.71467 14.5663 2.36392 12.0706L2.00207 9.4959Z"
          fill="currentColor"
          fillRule="evenodd"
        ></path>
        <g>
          <g clipPath="url(#:r7l:)">
            <rect
              fill="none"
              height="15.5"
              rx="3.75"
              stroke="currentColor"
              strokeWidth="1.5"
              width="15.5"
              x="6.75"
              y="5.8894"
            ></rect>
            <path
              d="M6.6546 17.8894L8.59043 15.9536C9.1583 15.3857 10.0727 15.3658 10.6647 15.9085L12.5062 17.5966C12.9009 17.9584 13.5105 17.9451 13.8891 17.5665L17.8181 13.6376C18.4038 13.0518 19.3536 13.0518 19.9394 13.6375L22.0663 15.7644"
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="1.5"
            ></path>
            <circle cx="10.75" cy="9.8894" fill="currentColor" r="1.25"></circle>
          </g>
        </g>
      </g>
      <defs>
        <clipPath id=":r7l:">
          <rect fill="white" height="17" rx="4.5" width="17" x="6" y="5.1394"></rect>
        </clipPath>
      </defs>
    </svg>
  )
}

export default Image
