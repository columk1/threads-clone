import { beforeEach, describe, expect, it, vi } from 'vitest'

import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should delay function execution', () => {
    const callback = vi.fn()
    const debounced = debounce(callback, 100)

    debounced()

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should only execute once for multiple rapid calls', () => {
    const callback = vi.fn()
    const debounced = debounce(callback, 100)

    debounced()
    debounced()
    debounced()

    vi.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should pass correct arguments to callback', () => {
    const callback = vi.fn()
    const debounced = debounce(callback, 100)

    debounced('test', 123)
    vi.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledWith('test', 123)
  })
})
