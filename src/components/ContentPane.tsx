import type { ReactNode } from 'react'

type ContentPaneProps = {
  children: ReactNode
}

// Reusable container component for consistent page layouts
export const ContentPane = ({ children }: ContentPaneProps) => {
  return (
    <div className="flex w-full flex-1 flex-col pb-28 md:rounded-t-3xl md:border-[0.5px] md:border-primary-border md:bg-elevated-bg">
      {children}
    </div>
  )
}
