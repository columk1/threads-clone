import type { ReactNode } from 'react'

import { cn } from './ui/utils'

type ContentPaneProps = {
  className?: string
  children: ReactNode
}

// Reusable container component for consistent page layouts
export const ContentPane = ({ className, children }: ContentPaneProps) => {
  return (
    <div
      className={cn(
        'flex w-full flex-1 flex-col pb-28 md:rounded-t-3xl md:border-[0.5px] md:border-primary-border md:bg-elevated-bg',
        className,
      )}
    >
      {children}
    </div>
  )
}
