export function formatCount(count: number): string {
  if (count < 1000) {
    return count.toString() // Return as is for numbers less than 1000
  }

  const formatted = (count / 1000).toFixed(count >= 10000 ? 0 : 1) // Use 1 decimal for numbers <10k
  return `${formatted.replace(/\.0$/, '')}K` // Remove trailing ".0" if any
}
