// import dynamic from 'next/dynamic'
import type { FunctionComponent } from 'react'

import { formatDate, getRelativeTime } from '@/utils/dateUtils'

const RelativeTimeLabel = ({ timestamp }: { timestamp: number }) => {
  return <span className="text-secondary-text">{getRelativeTime(timestamp)}</span>
}

type TimeAgoProps = {
  publishedAt: number // Unix timestamp in seconds
}

const TimeAgo: FunctionComponent<TimeAgoProps> = ({ publishedAt }) => {
  const timestamp = publishedAt * 1000
  const date = new Date(timestamp)
  return (
    <time suppressHydrationWarning dateTime={date.toISOString()} title={formatDate(date)}>
      {RelativeTimeLabel({ timestamp })}
    </time>
  )
}

// const DynamicTimeAgo = dynamic(() => Promise.resolve(TimeAgo), {
//   ssr: false,
// })

export default TimeAgo
