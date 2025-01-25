export const isWithinRange = (value: number, max: number, min: number): boolean => {
  return value >= min && value <= max
}

export const isTextWithinRange = (text: string, max: number, min: number = 1, trim = true): boolean => {
  const processedText = trim ? text.trim() : text
  return processedText.length >= min && processedText.length <= max
}
