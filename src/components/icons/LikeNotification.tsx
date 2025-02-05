import type { FunctionComponent } from 'react'

const LikeNotification: FunctionComponent = () => {
  return (
    <svg
      aria-label="Like Notification"
      role="img"
      viewBox="0 0 18 18"
      height="18px"
      width="18px"
      fill="white"
      className="rounded-full bg-[#FF007A]"
    >
      <title>Like Notification</title>
      <path d="M5 8.33956C5 6.84296 6.07645 5.75 7.48174 5.75C8.08884 5.75 8.61175 5.95938 9.00094 6.30299C9.3914 5.95863 9.91188 5.75 10.5183 5.75C11.9276 5.75 13 6.84345 13 8.33956C13 9.20812 12.6297 10.037 12.0266 10.7947C11.4237 11.5521 10.5712 12.2609 9.5565 12.9023L9.55379 12.904C9.48997 12.9437 9.41108 12.9882 9.32747 13.0242C9.25284 13.0563 9.1332 13.1001 9 13.1001C8.86687 13.1001 8.74693 13.0551 8.67518 13.0242C8.59318 12.9889 8.51482 12.9453 8.45151 12.9072L8.44748 12.9048L8.4435 12.9023C7.42882 12.2609 6.57626 11.5521 5.97338 10.7947C5.37032 10.037 5 9.20812 5 8.33956Z" />
    </svg>
  )
}

export default LikeNotification
