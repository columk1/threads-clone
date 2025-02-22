import type { ReactNode } from 'react'

type ContentPaneProps = {
  children: ReactNode
}

/**
 * Reusable container component for consistent page layouts
 * @param children - Content to be rendered inside the container
 * @returns JSX.Element
 */
export const ContentPane = ({ children }: ContentPaneProps) => {
  return (
    <div className="flex w-full flex-1 flex-col pb-28 md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
      {children}
    </div>
  )
}
