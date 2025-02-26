'use client'

import { useEffect } from 'react'

const ImageLoader: React.FC<{ images: string[] }> = ({ images }) => {
  useEffect(() => {
    // Preload all images in the array
    images.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [images])

  return null
}

export default ImageLoader
