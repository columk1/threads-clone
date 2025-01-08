export const stringToSafePublicId = (str: string) => {
  let hash = 0

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert to hex and ensure positive number
  return Math.abs(hash).toString(16)
}
