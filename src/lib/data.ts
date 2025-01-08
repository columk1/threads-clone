'use server'

import 'server-only'

import crypto from 'node:crypto'

import { redirect } from 'next/navigation'

import { Env } from '@/lib/Env'
import { validateRequest } from '@/lib/Lucia'

type uploadOptions = {
  [key: string]: string | undefined
}

export const signUploadForm = async (options: uploadOptions) => {
  const { user } = await validateRequest()

  if (!user) {
    redirect('/login')
  }

  if (!Env.CLOUDINARY_API_SECRET || !Env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !Env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
    throw new Error('Cloudinary environment variables not defined')
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString()

  const params: Record<string, string> = {
    timestamp,
    ...options,
  }

  const apiSecret = Env.CLOUDINARY_API_SECRET

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  const stringToSign = `${sortedParams}${apiSecret}`

  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')

  return {
    timestamp: String(timestamp),
    signature,
    apiKey: Env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  }
}
