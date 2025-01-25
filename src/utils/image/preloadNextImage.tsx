import Image from 'next/image'
import ReactDOM from 'react-dom/client'

import { applyConstraints } from './applyConstraints'

export const preloadNextImage = (url: string, width: number, height: number) => {
  if (typeof window === 'undefined') {
    return
  }

  const { containerWidth, containerHeight } = applyConstraints(width, height)

  // Create a hidden div to render the next/image component
  const div = document.createElement('div')
  div.style.position = 'absolute'
  div.style.width = '0'
  div.style.height = '0'
  div.style.overflow = 'hidden'
  document.body.appendChild(div)

  // Use ReactDOM to render the next/image component
  const root = ReactDOM.createRoot(div)
  root.render(
    <Image
      src={url}
      alt="pre-cache uploaded media"
      width={Number(containerWidth)}
      height={Number(containerHeight)}
      priority
    />,
  )

  // Return a cleanup function
  return () => {
    root.unmount()
    div.remove()
  }
}
