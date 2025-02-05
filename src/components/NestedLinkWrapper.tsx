import type { FunctionComponent } from 'react'

import { handleNestedInteraction } from '@/utils/handleNestedInteraction'

type NestedLinkWrapperProps = {
  onClick: () => void
  children: React.ReactNode
}

const NestedLinkWrapper: FunctionComponent<NestedLinkWrapperProps> = ({ onClick, children }) => {
  return (
    <div
      role="link"
      onPointerDown={() => {
        window.getSelection()?.removeAllRanges()
      }}
      onClick={(e) => {
        // Don't navigate if text is selected
        if (window.getSelection()?.toString()) {
          return
        }
        handleNestedInteraction(e, onClick)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNestedInteraction(e, onClick)
        }
      }}
      tabIndex={0}
      className="link cursor-pointer"
    >
      {children}
    </div>
  )
}

export default NestedLinkWrapper
