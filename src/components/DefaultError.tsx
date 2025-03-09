'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

import Button from '@/components/Button'
import { logClientError } from '@/utils/logClientError'

export default function DefaultError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logClientError(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-5">
        <h1 className="text-2xl font-semibold">500</h1>
        <div className="h-12 w-px bg-white/30"></div>
        <h2 className="text-sm">Something went wrong!</h2>
      </div>
      <Button
        variant="dark"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  )
}
