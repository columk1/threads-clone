import { describe, expect, it } from 'vitest'

import { applyConstraints } from './applyConstraints'

describe('applyConstraints', () => {
  it('should return auto dimensions when width or height is null', () => {
    expect(applyConstraints(null, 100)).toEqual({
      containerWidth: 'auto',
      containerHeight: 'auto',
    })
    expect(applyConstraints(100, null)).toEqual({
      containerWidth: 'auto',
      containerHeight: 'auto',
    })
    expect(applyConstraints(null, null)).toEqual({
      containerWidth: 'auto',
      containerHeight: 'auto',
    })
  })

  it('should maintain aspect ratio when scaling down', () => {
    // Test with image larger than max dimensions
    const result = applyConstraints(1086, 860) // 2x max dimensions
    const aspectRatio = (result.containerWidth as number) / (result.containerHeight as number)

    expect(aspectRatio).toBeCloseTo(1086 / 860, 2)
    expect(result.containerWidth).toBeLessThanOrEqual(543)
    expect(result.containerHeight).toBeLessThanOrEqual(430)
  })

  it('should not upscale images smaller than max dimensions', () => {
    const width = 300
    const height = 200
    const result = applyConstraints(width, height)

    expect(result).toEqual({
      containerWidth: width,
      containerHeight: height,
    })
  })

  it('should respect custom max dimensions', () => {
    const maxWidth = 800
    const maxHeight = 600
    const result = applyConstraints(1600, 1200, maxWidth, maxHeight)
    const aspectRatio = (result.containerWidth as number) / (result.containerHeight as number)

    expect(result.containerWidth).toBeLessThanOrEqual(maxWidth)
    expect(result.containerHeight).toBeLessThanOrEqual(maxHeight)
    expect(aspectRatio).toBeCloseTo(1600 / 1200, 2)
  })

  it('should round dimensions to whole numbers', () => {
    const result = applyConstraints(545, 432) // Will require scaling

    expect(Number.isInteger(result.containerWidth)).toBe(true)
    expect(Number.isInteger(result.containerHeight)).toBe(true)
  })
})
