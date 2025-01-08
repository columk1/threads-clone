import type { FunctionComponent } from 'react'

const LikeColor: FunctionComponent = () => {
  return (
    <svg aria-label="Like" role="img" viewBox="0 0 41 40" height="40px" width="40px" fill="transparent">
      <title>Like</title>
      <path
        d="M3.20833 15.625L3.20833 15.649C3.2083 16.769 3.20824 18.4099 3.92959 20.4394C4.65367 22.4765 6.05903 24.7911 8.69649 27.4285C12.7485 31.4805 17.182 34.7158 18.8602 35.8934C19.8479 36.5864 21.1543 36.5863 22.1419 35.8931C23.8197 34.7155 28.2517 31.4803 32.3035 27.4285C34.941 24.7911 36.3463 22.4765 37.0704 20.4394C37.7918 18.4099 37.7917 16.7689 37.7917 15.649V15.625C37.7917 10.3982 34.2039 5.83333 28.625 5.83333C26.0073 5.83333 23.9882 7.06386 22.5055 8.59512C21.7118 9.41483 21.0498 10.3411 20.5 11.2594C19.9502 10.3411 19.2882 9.41483 18.4945 8.59513C17.0118 7.06386 14.9927 5.83333 12.375 5.83333C6.79607 5.83333 3.20833 10.3982 3.20833 15.625Z"
        stroke="url(#paint0_linear_4272_8156)"
        strokeWidth="3.33333"
      ></path>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_4272_8156"
          x1="4.875"
          x2="32.1518"
          y1="35"
          y2="4.00361"
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

export default LikeColor
