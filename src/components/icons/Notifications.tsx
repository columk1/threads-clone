import type { FunctionComponent } from 'react'

import { useNotifications } from '@/contexts/NotificationsContext'

// import { validateRequest } from '@/lib/Lucia'

type NotificationsProps = {
  className?: string
  isActive?: boolean
}

const Notifications: FunctionComponent<NotificationsProps> = ({ className, isActive }) => {
  const { unseenCount } = useNotifications()
  const hasNotifications = unseenCount > 0 && !isActive
  // const [hasNotification, setHasNotification] = useState(false)

  // const { user } = await validateRequest()

  // useEffect(() => {
  //   if (user) {
  //     setHasNotification(true)
  //   }
  // }, [user])

  return (
    <svg
      aria-label={`Notifications ${hasNotifications ? ` (${unseenCount})` : ''}`}
      role="img"
      viewBox="0 0 32 32"
      width="30px"
      height="30px"
      fill={isActive ? 'currentColor' : 'transparent'}
      className={className}
    >
      <title>
        Notifications
        {hasNotifications ? ` (${unseenCount})` : ''}
      </title>
      <path
        d="M5.5 12.8568C5.5 17.224 9.22178 21.5299 15.0332 25.2032C15.3554 25.397 15.7401 25.5909 16 25.5909C16.2703 25.5909 16.655 25.397 16.9668 25.2032C22.7782 21.5299 26.5 17.224 26.5 12.8568C26.5 9.11212 23.8698 6.5 20.4599 6.5C18.4847 6.5 16.9356 7.39792 16 8.74479C15.0851 7.40812 13.5257 6.5 11.5401 6.5C8.14059 6.5 5.5 9.11212 5.5 12.8568Z"
        stroke="currentColor"
        strokeWidth="2.5"
      ></path>
      {hasNotifications && (
        <>
          <circle cx="28" cy="9" fill="var(--primary-bg)" r="6" />
          <circle cx="28" cy="9" fill="var(--notification)" r="4" />
        </>
      )}
    </svg>
  )
}

export default Notifications
