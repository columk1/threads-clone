import type { FunctionComponent } from 'react'

type LinkProps = {
  className?: string
}

const Link: FunctionComponent<LinkProps> = ({ className }) => {
  return (
    <svg aria-label="" role="img" viewBox="0 0 18 18" fill="none" height="21px" width="21px" className={className}>
      <title></title>
      <path d="M8.39992 5.44993L9.50669 4.34316C11.2046 2.64524 13.9575 2.64524 15.6554 4.34316V4.34316V4.34316C17.3533 6.04108 17.3533 8.79396 15.6554 10.4919L14.5486 11.5987" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65"></path>
      <path d="M5.44773 8.40114L4.34096 9.50791C2.64304 11.2058 2.64304 13.9587 4.34096 15.6566V15.6566V15.6566C6.03889 17.3546 8.79176 17.3546 10.4897 15.6566L11.5965 14.5499" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65"></path>
      <path d="M12.7051 7.29565L7.2942 12.7065" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65"></path>
    </svg>
  )
}

export default Link
