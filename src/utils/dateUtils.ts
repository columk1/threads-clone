export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date)
}

export const getRelativeTime = (epochMs: number) => {
  const now = new Date()
  const diffMs = now.getTime() - epochMs

  const secondsAgo = Math.floor(diffMs / 1000)
  if (secondsAgo < 60) {
    // return `${secondsAgo}s`
    return 'now'
  }

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) {
    return `${minutesAgo}m`
  }

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) {
    return `${hoursAgo}h`
  }

  const daysAgo = Math.floor(hoursAgo / 24)
  return `${daysAgo}d`
}

// Get the time from now in minutes and seconds (used for email verification code validation error)
export const timeFromNow = (time: Date) => {
  const now = new Date()
  const diff = time.getTime() - now.getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const seconds = Math.floor(diff / 1000) % 60
  return `${minutes}m ${seconds}s`
}

export const isWithinExpirationDate = (date: Date): boolean => {
  return Date.now() < date.getTime()
}
