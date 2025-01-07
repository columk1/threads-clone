import type { FunctionComponent } from 'react'

type EditColorProps = {
  className?: string
}

const EditColor: FunctionComponent<EditColorProps> = ({ className }) => {
  return (
    <svg
      aria-label="Post"
      role="img"
      viewBox="0 0 41 40"
      fill="transparent"
      height="48px"
      width="48px"
      className={className}
    >
      <title>Post</title>
      <path
        clipRule="evenodd"
        d="M3.83325 20.2309L3.83325 20.3045C3.83324 22.827 3.83323 24.8221 3.96455 26.4294C4.09873 28.0717 4.37829 29.4553 5.021 30.7167C6.06578 32.7672 7.73287 34.4343 9.78336 35.4791C11.0448 36.1218 12.4284 36.4013 14.0707 36.5355C15.6779 36.6668 17.673 36.6668 20.1954 36.6668H20.1956H20.2691H20.7307H20.8042H20.8044C23.3269 36.6668 25.3219 36.6668 26.9292 36.5355C28.5715 36.4013 29.9551 36.1218 31.2165 35.4791C33.267 34.4343 34.9341 32.7672 35.9788 30.7167C36.6215 29.4553 36.9011 28.0717 37.0353 26.4294C37.1666 24.8221 37.1666 22.827 37.1666 20.3044V20.2309V20.0002C37.1666 19.0797 36.4204 18.3335 35.4999 18.3335C34.5794 18.3335 33.8332 19.0797 33.8332 20.0002V20.2309C33.8332 22.8433 33.832 24.7023 33.713 26.158C33.5957 27.5941 33.3722 28.4902 33.0088 29.2034C32.2836 30.6267 31.1265 31.7839 29.7032 32.5091C28.99 32.8724 28.0939 33.0959 26.6577 33.2133C25.2021 33.3322 23.343 33.3335 20.7307 33.3335H20.2691C17.6568 33.3335 15.7978 33.3322 14.3421 33.2133C12.9059 33.0959 12.0098 32.8724 11.2967 32.5091C9.87338 31.7839 8.71622 30.6267 7.99102 29.2034C7.62764 28.4902 7.40415 27.5941 7.28681 26.158C7.16788 24.7023 7.16659 22.8433 7.16659 20.2309V19.7694C7.16659 17.157 7.16788 15.298 7.28681 13.8424C7.40415 12.4062 7.62764 11.5101 7.99102 10.7969C8.71622 9.37362 9.87338 8.21646 11.2967 7.49127C12.0098 7.12789 12.9059 6.9044 14.3421 6.78706C15.7978 6.66813 17.6568 6.66683 20.2691 6.66683H20.4999C21.4204 6.66683 22.1666 5.92064 22.1666 5.00016C22.1666 4.07969 21.4204 3.3335 20.4999 3.3335L20.2691 3.3335L20.1956 3.3335C17.6731 3.33348 15.678 3.33347 14.0707 3.46479C12.4284 3.59898 11.0448 3.87853 9.78335 4.52125C7.73287 5.56602 6.06578 7.23312 5.021 9.2836C4.37829 10.545 4.09873 11.9286 3.96455 13.5709C3.83323 15.1782 3.83324 17.1733 3.83325 19.6958L3.83325 19.7694L3.83325 20.2309ZM35.1401 7.71717C35.791 7.06629 35.791 6.01102 35.1401 5.36014C34.4892 4.70927 33.4339 4.70927 32.7831 5.36014L20.4754 17.6678C19.8245 18.3187 19.8245 19.374 20.4754 20.0249C21.1263 20.6757 22.1815 20.6757 22.8324 20.0249L35.1401 7.71717Z"
        fill="url(#paint0_linear_4272_9119)"
        fillRule="evenodd"
      ></path>
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_4272_9119"
          x1="3.83325"
          x2="37.1666"
          y1="36.6668"
          y2="3.3335"
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

export default EditColor
