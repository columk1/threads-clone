'use server'

import cloudinary from '@/config/cloudinary.config'
import { Env } from '@/libs/Env'

export const signUploadForm = async () => {
  if (!Env.CLOUDINARY_API_SECRET || !Env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !Env.NEXT_PUBLIC_CLOUDINARY_API_KEY) {
    throw new Error('Cloudinary environment variables not defined')
  }

  const timestamp = Math.round((new Date()).getTime() / 1000)

  const signature = cloudinary.utils.api_sign_request({
    timestamp,
    eager: 'c_fit,h_250,w_250',
    folder: 'threads-clone/avatars',
  }, Env.CLOUDINARY_API_SECRET)

  return {
    timestamp: String(timestamp),
    signature,
    cloudname: Env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: Env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  }
}
