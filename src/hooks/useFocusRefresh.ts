'use client'

import { useEffect, useRef } from 'react'

type UpdaterFunction<T> = (data: T) => void

export function useFocusRefresh<T>({
  url,
  onUpdate,
  enabled = true,
  interactionTime,
  bufferTime = 2000,
  delayTime = 100,
}: {
  url: string
  onUpdate: UpdaterFunction<T>
  enabled?: boolean
  interactionTime?: number
  bufferTime?: number
  delayTime?: number
}) {
  const updateTimeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (!enabled) {
      return () => {}
    }

    const updateData = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          return
        }

        const data = (await response.json()) as T
        onUpdate(data)
      } catch (error) {
        console.error('Error updating data:', error)
      }
    }

    const onFocus = () => {
      // Clear any pending update
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      // Check if we should skip due to recent interaction
      if (interactionTime && Date.now() - interactionTime < bufferTime) {
        return
      }

      // Add a small delay to allow for any pending interactions to complete
      updateTimeoutRef.current = setTimeout(() => {
        updateData()
      }, delayTime)
    }

    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [url, onUpdate, enabled, interactionTime, bufferTime, delayTime])
}
