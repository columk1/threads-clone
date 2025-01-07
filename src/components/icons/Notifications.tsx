import type { FunctionComponent } from 'react'

type NotificationsProps = {
  className?: string
  isActive?: boolean
}

const Notifications: FunctionComponent<NotificationsProps> = ({ className, isActive }) => {
  return (
    <svg
      aria-label="Notifications"
      role="img"
      viewBox="0 0 32 32"
      width="30px"
      height="30px"
      fill={isActive ? 'currentColor' : 'transparent'}
      className={className}
    >
      <title>Notifications</title>
      <path
        d="M5.5 12.8568C5.5 17.224 9.22178 21.5299 15.0332 25.2032C15.3554 25.397 15.7401 25.5909 16 25.5909C16.2703 25.5909 16.655 25.397 16.9668 25.2032C22.7782 21.5299 26.5 17.224 26.5 12.8568C26.5 9.11212 23.8698 6.5 20.4599 6.5C18.4847 6.5 16.9356 7.39792 16 8.74479C15.0851 7.40812 13.5257 6.5 11.5401 6.5C8.14059 6.5 5.5 9.11212 5.5 12.8568Z"
        stroke="currentColor"
        strokeWidth="2.5"
      ></path>
    </svg>
    // <svg aria-label="Notifications" role="img" viewBox="0 0 32 32" fill={isActive ? 'currentColor' : 'transparent'} height="30px" width="30px" className={className}>
    //   <title>Notifications</title>
    //   <path clipRule="evenodd" d="M27.5009 14.9795C27.0841 16.7611 26.164 18.469 24.8907 20.0687C23.1197 22.2936 20.6153 24.3758 17.6347 26.2598L17.6267 26.2649L17.6267 26.2648C17.4393 26.3813 17.2075 26.5122 16.962 26.6179C16.7428 26.7122 16.3913 26.8409 16 26.8409C15.6089 26.8409 15.2566 26.7086 15.0458 26.6179C14.805 26.5143 14.5748 26.3862 14.3889 26.2744L14.377 26.2672L14.3653 26.2598C11.3847 24.3758 8.88028 22.2936 7.10932 20.0687C5.33782 17.8431 4.25 15.4082 4.25 12.8568C4.25 8.46057 7.41206 5.25 11.5401 5.25C13.3234 5.25 14.8595 5.86505 16.0027 6.8744C17.1497 5.86286 18.6787 5.25 20.4599 5.25C21.3602 5.25 22.2137 5.40192 22.9982 5.68488C22.5401 6.37469 22.2209 7.16472 22.0805 8.01506C21.5761 7.84135 21.0309 7.75 20.4599 7.75C18.8943 7.75 17.7286 8.44729 17.0266 9.45793L15.9924 10.9468L14.9685 9.45082C14.2895 8.45889 13.1184 7.75 11.5401 7.75C8.86912 7.75 6.75 9.76367 6.75 12.8568C6.75 14.6726 7.52307 16.5742 9.06532 18.5117C10.6059 20.4471 12.8638 22.3518 15.6888 24.1388C15.8069 24.2095 15.9148 24.2676 16.0039 24.3081C16.0898 24.2688 16.1934 24.212 16.3032 24.1439C19.1319 22.3554 21.3927 20.449 22.9347 18.5117C24.0857 17.0657 24.8083 15.6396 25.1008 14.2543C25.8228 14.6536 26.6359 14.9083 27.5009 14.9795Z" fill="currentColor" fillRule="evenodd"></path>
    //   <circle cx="28" cy="9" fill="var(--notification)" r="4"></circle>
    // </svg>
  )
}

export default Notifications
