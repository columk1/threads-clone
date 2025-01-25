export const applyConstraints = (width: number | null, height: number | null, maxWidth = 543, maxHeight = 430) => {
  if (!width || !height) {
    return {
      containerWidth: 'auto',
      containerHeight: 'auto',
    }
  }
  const widthRatio = maxWidth / width
  const heightRatio = maxHeight / height
  const scale = Math.min(widthRatio, heightRatio, 1) // Scale down if needed, but don't upscale
  return {
    containerWidth: Math.round(width * scale),
    containerHeight: Math.round(height * scale),
  }
}
