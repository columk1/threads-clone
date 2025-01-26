'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { IMG_UPLOAD_URL } from '@/lib/constants'
import { signUploadForm } from '@/lib/data'
import { type ImageData, imageSchema } from '@/lib/schemas/zod.schema'

export const useImageForm = () => {
  const [image, setImage] = useState<string | null>(null)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadButtonClick = useCallback(() => {
    fileInputRef?.current?.click()
  }, [fileInputRef])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    try {
      await imageSchema.parseAsync(file)
      const optimisticUrl = URL.createObjectURL(file)
      setImage(optimisticUrl)
      setUploading(true)

      const options = { eager: 'c_fit,h_430,w_508', folder: 'threads-clone/content' }
      const signData = await signUploadForm(options)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.apiKey)
      formData.append('timestamp', signData.timestamp)
      formData.append('signature', signData.signature)
      Object.entries(options).forEach(([key, value]) => formData.append(key, value))

      const res = await fetch(IMG_UPLOAD_URL, { method: 'POST', body: formData })
      const data = await res.json()

      setImageData({
        url: data.secure_url,
        width: data.width,
        height: data.height,
      })
      setUploading(false)
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast(err.issues[0]?.message)
      } else {
        toast('Oops! Something went wrong. Please try again.')
      }
      setImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

  return {
    image,
    imageData,
    uploading,
    fileInputRef,
    handleFileChange,
    handleUploadButtonClick,
    setImage,
    setImageData,
  }
}
