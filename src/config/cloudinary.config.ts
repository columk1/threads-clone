import { v2 as cloudinary } from 'cloudinary'

import { Env } from '@/libs/Env'

cloudinary.config({
  cloud_name: Env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: Env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET,
})

export default cloudinary
