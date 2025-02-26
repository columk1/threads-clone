import { Env } from '@/lib/Env'

export const VERIFIED_EMAIL_ALERT = 'VERIFIED_EMAIL_ALERT'

export const REPORTED_CONFIRMATION_MESSAGE = 'Thanks for your feedback. Our team will review this soon.'

export const IMG_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${Env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

export const MAX_CHARACTERS = 500
export const BIO_CHARACTER_LIMIT = 150
